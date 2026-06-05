/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Load environmental parameters
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware configurations
app.use(express.json({ limit: '10mb' }));

// Helper to safely fetch Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI Sourcing / JDs will fall back to smart simulations.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const ai = getGeminiClient();

// API Health Entry
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasKey: !!process.env.GEMINI_API_KEY });
});

/**
 * 1. API: Generate JD Details based on Recruiter Request
 */
app.post('/api/generate-jd', async (req, res) => {
  const { title, industry, location, salaryRange, experience, skills, workingMode, hiresCount } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const prompt = `Bạn là một AI Recruitment Specialist chuyên nghiệp (ATS Expert). Hãy tạo một bộ tài liệu tuyển dụng chi tiết bằng TIẾNG VIỆT (mặc định) cho vị trí sau:
  - Chức danh: ${title}
  - Lĩnh vực: ${industry || 'Công nghệ'}
  - Địa điểm: ${location || 'Việt Nam'}
  - Khoảng lương: ${salaryRange || 'Thỏa thuận'}
  - Yêu cầu kinh nghiệm: ${experience || 'Không yêu cầu'}
  - Kỹ năng bắt buộc: ${skills || 'Phụ thuộc vị trí'}
  - Hình thức làm việc: ${workingMode || 'All'}
  - Số lượng tuyển: ${hiresCount || 1}`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Bạn là chuyên viên Nhân sự cấp cao. Hãy trả về kết quả dưới dạng JSON có cấu trúc tối ưu. Viết tiếng Việt chuẩn.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimizedTitle: { type: Type.STRING, description: 'Chức danh vị trí đã được tối ưu hóa SEO tuyển dụng' },
              jdText: { type: Type.STRING, description: 'Bản mô tả công việc (JD) đầy đủ bằng Markdown có các phần: Mô tả vị trí, Nhiệm vụ chính, Yêu cầu ứng viên, Quyền lợi & Phúc lợi.' },
              facebook: { type: Type.STRING, description: 'Bài đăng tuyển dụng thu hút trên Facebook kèm theo hashtag bắt mắt' },
              linkedin: { type: Type.STRING, description: 'Bài đăng chuyên nghiệp trên LinkedIn tập trung vào giải bài toán và phát triển nghề nghiệp' },
              vietnamworks: { type: Type.STRING, description: 'Nội dung JD tối ưu theo chuẩn VietnamWorks' },
              topcv: { type: Type.STRING, description: 'Nội dung JD ngắn gọn, nhấn mạnh đãi ngộ chuẩn TopCV' },
              seo: { type: Type.STRING, description: 'Từ khóa SEO và Thẻ mô tả tối ưu hóa Google tìm kiếm việc làm' }
            },
            required: ['optimizedTitle', 'jdText', 'facebook', 'linkedin', 'vietnamworks', 'topcv', 'seo']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text from Gemini");
      }
      return res.json(JSON.parse(responseText.trim()));
    } else {
      // Return beautiful mock JD if API key is not supplied
      return res.json(getSimulatedJD(title, workingMode, salaryRange, skills, location));
    }
  } catch (err: any) {
    console.error('Gemini JD Generation error:', err);
    return res.status(500).json({ error: 'AI JD Generation failed. Using rich simulated fallback docs.', fallback: getSimulatedJD(title, workingMode, salaryRange, skills, location) });
  }
});

/**
 * 2. API: Parse Uploaded Candidate CV Profile
 */
app.post('/api/parse-cv', async (req, res) => {
  const { cvText, fileName } = req.body;

  const rawText = cvText || `Nguyen Duc Anh - Senior React Developer. Email: ducanh@gmail.com. Phone: 0912345678. Hanoi, Vietnam. Skills: React, TypeScript, Tailwind, Firebase, Express, Node. Experience: 4 years building SaaS platforms. Education: Bachelor of Computer Science - Hanoi University of Science and Technology. Languages: English, Vietnamese.`;

  const prompt = `Hãy đóng vai làm một CV Parser Agent chuyên nghiệp và phân tích văn bản CV sau để trích xuất các trường thông tin quan trọng. Trả về định dạng JSON đúng quy định.
  Văn bản CV:
  ${rawText}`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Trích xuất thông tin CV chuẩn xác và trả về JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Họ tên ứng viên' },
              email: { type: Type.STRING, description: 'Địa chỉ email trích xuất' },
              phone: { type: Type.STRING, description: 'Số điện thoại trích xuất' },
              address: { type: Type.STRING, description: 'Địa chỉ nơi ở hiện tại' },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách các kỹ năng kỹ thuật cấu tạo từ CV'
              },
              experience: { type: Type.STRING, description: 'Tóm tắt nhanh quá trình kinh nghiệm làm việc' },
              education: { type: Type.STRING, description: 'Thông tin học vấn, trường đại học học tập' },
              languages: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Các ngôn ngữ giao tiếp'
              }
            },
            required: ['name', 'email', 'skills', 'experience', 'education']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text from Gemini");
      }
      return res.json(JSON.parse(responseText.trim()));
    } else {
      return res.json(getSimulatedCandidateExtraction(rawText, fileName));
    }
  } catch (err: any) {
    console.error('Gemini CV Parsing error:', err);
    return res.json(getSimulatedCandidateExtraction(rawText, fileName));
  }
});

/**
 * 3. API: Candidate AI Matching Score & Comprehensive Analytics
 */
app.post('/api/analyze-candidate', async (req, res) => {
  const { job, candidate } = req.body;

  if (!job || !candidate) {
    return res.status(400).json({ error: 'Job details and Candidate profile are both required' });
  }

  const prompt = `So sánh hồ sơ Ứng viên (Candidate) và Yêu cầu công việc (Job) dưới đây để tiến hành chấm điểm matching (0-100) và đưa ra phân tích chi tiết bằng TIẾNG VIỆT:
  
  MÔ TẢ CÔNG VIỆC:
  - Vị trí: ${job.title}
  - Yêu cầu kỹ năng: ${job.skills}
  - Kinh nghiệm yêu cầu: ${job.experience}
  - Mức lương: ${job.salaryRange}
  - Chế độ: ${job.workingMode}

  HỒ SƠ ỨNG VIÊN:
  - Tên: ${candidate.name}
  - Kỹ năng của ứng viên: ${(candidate.skills || []).join(', ')}
  - Kinh nghiệm của ứng viên: ${candidate.experience}
  - Địa chỉ: ${candidate.address || 'Không ghi rõ'}`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Hãy phân tích đối sánh ứng viên với mô tả công việc (Fit Score & Skill Gap Analysis). Trả về JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchingScore: { type: Type.INTEGER, description: 'Điểm phù hợp tổng quan từ 0 đến 100' },
              skillsMatch: { type: Type.INTEGER, description: 'Điểm khớp kỹ năng chuyên môn từ 0 đến 100' },
              experienceMatch: { type: Type.INTEGER, description: 'Điểm khớp số năm/mức độ kinh nghiệm từ 0 đến 100' },
              salaryMatch: { type: Type.INTEGER, description: 'Hiệu số phù hợp ngân sách tuyển dụng từ 0 đến 100' },
              locationMatch: { type: Type.INTEGER, description: 'Mức độ tiện lợi và phù hợp địa điểm/on-site từ 0 đến 100' },
              summary: { type: Type.STRING, description: 'Tóm tắt nhận diện tiềm năng ứng viên trong 2-3 câu' },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách 3-4 điểm mạnh nổi trội nhất'
              },
              weaknesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách 2-3 điểm yếu hoặc điểm chưa phù hợp'
              },
              missingSkills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Các kỹ năng cốt lõi trong JD nhưng ứng viên chưa có hoặc chưa mạnh'
              },
              interviewQuestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Danh sách 4-5 câu hỏi phỏng vấn đặc thù để khai thác thêm năng lực của ứng viên này'
              },
              recommendation: { type: Type.STRING, description: 'Khuyên dùng tuyển chọn: Excellent, Good, Average, hoặc Poor' }
            },
            required: ['matchingScore', 'summary', 'strengths', 'weaknesses', 'missingSkills', 'interviewQuestions', 'recommendation']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text from Gemini");
      }
      return res.json(JSON.parse(responseText.trim()));
    } else {
      return res.json(getSimulatedCandidateAnalysis(job, candidate));
    }
  } catch (err: any) {
    console.error('Gemini Candidate Analysis error:', err);
    return res.json(getSimulatedCandidateAnalysis(job, candidate));
  }
});

/**
 * 4. API: Generates customized email (Invitation/Offer/Rejection)
 */
app.post('/api/generate-email', async (req, res) => {
  const { type, candidateName, jobTitle, companyName } = req.body;

  const emailType = type || 'Invitation';
  const company = companyName || 'AI Recruitment Agency';
  const job = jobTitle || 'Phát triển sản phẩm';

  const prompt = `Viết thư điện tử tuyển dụng bằng Tiếng Việt (Email) loại "${emailType}" gửi cho ứng viên tên là "${candidateName || 'Nguyễn Văn A'}" cho vị trí ứng tuyển "${job}". Thư gửi từ công ty "${company}".`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Viết email tuyển dụng chuẩn chỉ, lịch thiệp, dễ mến và có độ dài trung bình.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING, description: 'Tiêu đề Email' },
              body: { type: Type.STRING, description: 'Nội dung thư tuyển dụng (HTML hoặc xuống dòng sạch sẽ)' }
            },
            required: ['subject', 'body']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text from Gemini");
      }
      return res.json(JSON.parse(responseText.trim()));
    } else {
      return res.json(getSimulatedEmail(emailType, candidateName, job, company));
    }
  } catch (err: any) {
    console.error('Gemini Email Generation error:', err);
    return res.json(getSimulatedEmail(emailType, candidateName, job, company));
  }
});

/**
 * 5. API: Scan professional social networks and communities for matching profiles
 */
app.post('/api/scan-social-candidates', async (req, res) => {
  const { job } = req.body;
  if (!job) {
    return res.status(400).json({ error: 'Job details are required for social scanning' });
  }

  const prompt = `Bạn là một AI Sourcing Specialist cao cấp chuyên thám thính và thu hoạch hồ sơ từ LinkedIn, Facebook groups, GitHub. Hãy quét và tìm kiếm 3 hồ sơ ứng viên giả lập xuất sắc phù hợp tối đa với mô tả công việc (JD) sau đây:

  TIÊU CHÍ TUYỂN DỤNG CỦA CÔNG TY:
  - Vị trí: ${job.title}
  - Lĩnh vực: ${job.industry || 'Công nghệ thông tin'}
  - Địa điểm: ${job.location || 'Việt Nam'}
  - Kinh nghiệm: ${job.experience || 'Chưa giới hạn'}
  - Kỹ năng bắt buộc: ${job.skills || 'Ứng biến kỹ thuật'}
  - Chế độ/Mức lương: ${job.workingMode || 'Hybrid'} / ${job.salaryRange || 'Cạnh tranh'}

  Hãy sinh ra mảng JSON có chứa chính xác 3 đối tượng ứng viên viết bằng TIẾNG VIỆT tự nhiên, chân thực. Mỗi ứng viên có đầy đủ thông tin: họ tên tiếng Việt, email thực tế phù hợp, số điện thoại, địa chỉ cư trú, mảng danh sách kỹ năng chuyên môn, tóm tắt kinh nghiệm sâu sắc, học vấn trường học danh tiếng tại Việt Nam, mảng ngoại ngữ, điểm khớp (matchScore từ 0 đến 100), nền tảng MXH phát hiện chuyên biệt (sourcePlatform: LinkedIn, Facebook, hoặc GitHub), đường dẫn trang cá nhân sinh động (profileUrl), và một phần giải thích lý do cụ thể vì sao họ lọt vào radar (matchReason).`;

  try {
    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Bạn là chuyên viên Nhân sự số hóa AI Sourcing. Hãy săn tìm ứng viên phù hợp trên MXH và trả về kết quả mảng JSON chuẩn xác tuyệt đối mô tả cấu trúc ứng viên.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Họ tên hồ sơ ứng viên tìm thấy' },
                email: { type: Type.STRING, description: 'Địa chỉ Email' },
                phone: { type: Type.STRING, description: 'Số điện thoại liên lạc' },
                address: { type: Type.STRING, description: 'Địa điểm cư trú' },
                skills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Tập hợp kỹ năng trích xuất từ profile'
                },
                experience: { type: Type.STRING, description: 'Tóm tắt kinh nghiệm vị trí tương đương' },
                education: { type: Type.STRING, description: 'Thông tin học vấn' },
                languages: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Ngôn ngữ giao tiếp'
                },
                matchScore: { type: Type.INTEGER, description: 'Điểm khớp từ 0 đến 100 dựa trên mô tả JD' },
                sourcePlatform: { type: Type.STRING, description: 'Nền tảng: LinkedIn, Facebook, GitHub hoặc X' },
                profileUrl: { type: Type.STRING, description: 'Liên kết profile cá nhân chi tiết' },
                matchReason: { type: Type.STRING, description: 'Lý do lọt vào radar và đề cử cụ thể' }
              },
              required: ['name', 'email', 'phone', 'address', 'skills', 'experience', 'education', 'matchScore', 'sourcePlatform', 'profileUrl', 'matchReason']
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text from Gemini");
      }
      return res.json(JSON.parse(responseText.trim()));
    } else {
      return res.json(getSimulatedScannedCandidates(job));
    }
  } catch (err: any) {
    console.error('Gemini Social Scanning error:', err);
    return res.json(getSimulatedScannedCandidates(job));
  }
});

/**
 * 6. API: Perplexity Real-time Talent & Web Search Sourcing
 */
app.post('/api/perplexity-search', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const prompt = `Bạn là hệ thống tìm kiếm thông tin nhân sự toàn cầu Perplexity AI. Hãy thực hiện quét dữ liệu internet thực tế theo từ khóa yêu cầu của HR dưới đây:
  
  TỪ KHÓA TÌM KIẾM CỦA HR: "${query}"
  
  Hãy mô phỏng việc truy quét dữ liệu và phân tích chiều sâu để trả về danh sách chính xác 3 ứng viên thực tế hoặc tiềm năng tìm được từ mạng internet (như LinkedIn, GitHub, Facebook...).
  Đầu ra PHẢI là một mảng JSON chuẩn gồm 3 đối tượng ứng viên, viết bằng TIẾNG VIỆT tự nhiên. Mỗi đối tượng bắt buộc phải có đủ cấu trúc trường thông tin sau:
  - name: Họ tên đầy đủ (tiếng Việt phong phú)
  - email: Địa chỉ email của ứng viên
  - phone: Số điện thoại liên hệ thực tế hoặc mô phỏng
  - address: Địa điểm sinh sống làm việc tại Việt Nam
  - skills: Mảng các kỹ năng kỹ thuật/chuyên môn (VD: ["React", "TypeScript", "Python"])
  - experience: Tóm tắt kinh nghiệm sâu sắc của họ
  - education: Đại học hoặc chứng chỉ liên quan
  - languages: Mảng các ngôn ngữ (VD: ["Tiếng Việt", "Tiếng Anh"])
  - matchScore: Điểm phù hợp (từ 70 đến 99) dựa trên từ khóa tìm kiếm
  - sourcePlatform: "LinkedIn" hoặc "GitHub" hoặc "Facebook" hoặc "Perplexity Search"
  - profileUrl: Một đường dẫn liên kết profile cá nhân thực tế hoặc bán thực tế tương ứng với họ tên (VD: https://linkedin.com/in/...)
  - matchReason: Lý do cụ thể vì sao họ lọt vào kết quả tìm kiếm của Perplexity AI`;

  try {
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (perplexityApiKey) {
      try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${perplexityApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'sonar-reasoning',
            messages: [
              {
                role: 'system',
                content: 'Bạn là chuyên viên AI Sourcing của Perplexity. Hãy tìm kiếm 3 hồ sơ ứng viên tương thích trên web và trả về định dạng JSON mảng các đối tượng chứa: name, email, phone, address, skills (mảng), experience, education, languages (mảng), matchScore (số), sourcePlatform, profileUrl, matchReason.'
              },
              {
                role: 'user',
                content: `Tìm kiếm hồ sơ ứng viên cho yêu cầu: ${query}`
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const pContent = data.choices?.[0]?.message?.content;
          if (pContent) {
            const jsonMatch = pContent.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (jsonMatch) {
              return res.json(JSON.parse(jsonMatch[0]));
            }
          }
        }
      } catch (err) {
        console.warn("Real Perplexity call output failed, falling back to Gemini:", err);
      }
    }

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'Bạn là chuyên gia nhân sự kết nối công nghệ tìm kiếm sâu Perplexity AI. Trả về kết quả là mảng JSON của 3 ứng viên.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: 'Họ tên hồ sơ ứng viên tìm thấy' },
                email: { type: Type.STRING, description: 'Địa chỉ Email' },
                phone: { type: Type.STRING, description: 'Số điện thoại liên lạc' },
                address: { type: Type.STRING, description: 'Địa điểm cư trú' },
                skills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Tập hợp kỹ năng trích xuất từ profile'
                },
                experience: { type: Type.STRING, description: 'Tóm tắt kinh nghiệm vị trí tương đương' },
                education: { type: Type.STRING, description: 'Thông tin học văn' },
                languages: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Ngôn ngữ giao tiếp'
                },
                matchScore: { type: Type.INTEGER, description: 'Điểm khớp từ 0 đến 100 dựa trên mô tả JD' },
                sourcePlatform: { type: Type.STRING, description: 'Nền tảng: LinkedIn, Facebook, GitHub hoặc Perplexity Search' },
                profileUrl: { type: Type.STRING, description: 'Liên kết profile cá nhân' },
                matchReason: { type: Type.STRING, description: 'Giải thích chi tiết tại sao Perplexity đề xuất ứng viên này' }
              },
              required: ['name', 'email', 'phone', 'address', 'skills', 'experience', 'education', 'matchScore', 'sourcePlatform', 'profileUrl', 'matchReason']
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text from Gemini");
      }
      return res.json(JSON.parse(responseText.trim()));
    } else {
      return res.json(getSimulatedPerplexitySearch(query));
    }
  } catch (err: any) {
    console.error('Perplexity Sourcing Search error:', err);
    return res.json(getSimulatedPerplexitySearch(query));
  }
});

// === AUXILIARY MOCK SIMULATION ENGINE ===

function getSimulatedJD(title: string, mode: string, salary: string, skills: string, location: string) {
  const finalTitle = title ? title + " (AI Optimized)" : "Lập trình viên Full Stack React";
  return {
    optimizedTitle: finalTitle,
    jdText: `## Mô tả Công việc - ${finalTitle}\n\nChúng tôi đang tìm kiếm đồng nghiệp đồng hành cùng phát triển giải pháp SaaS tuyển dụng đột phá.\n\n### 1. Nhiệm vụ chính\n- Tham gia nghiên cứu, phát triển các tính năng và module cho platform cốt lõi.\n- Tối ưu hóa UI/UX ứng dụng trên Mobile & Desktop.\n- Hợp tác chặt chẽ với AI Agent để cấu tạo cơ sở dữ liệu.\n\n### 2. Yêu cầu ứng viên\n- Kinh nghiệm làm việc thực tế, am hiểu **${skills || 'TypeScript, React'}**.\n- Tư duy thuật toán tốt, yêu thích làm việc với AI.\n- Khả năng làm việc mô hình **${mode || 'Hybrid'}** tại **${location || 'Hồ Chí Minh'}**.\n\n### 3. Quyền lợi\n- Lương hấp dẫn: **${salary || 'Lên tới 2,500$'}**.\n- Thưởng dự án tháng/năm cực kỳ cạnh tranh.\n- Bảo hiểm chất lượng cao quốc tế, môi trường trẻ trung.`,
    facebook: `🚀 [TUYỂN DỤNG CỰC "HOT"] 🚀\n\n📌 Cơ hội phát triển cùng AI-powered Recruitment Agent SaaS!\n🔥 Vị trí: **${finalTitle}**\n📍 Hình thức: ${mode || 'Hybrid'} tại ${location || 'Hà Nội'}\n💵 Mức đãi ngộ: ${salary || 'Cạnh tranh, Thỏa thuận'}\n\n👉 Yêu cầu cơ bản: Sẵn sàng thực chiến với những công nghệ đỉnh cao như ${skills || 'React & TypeScript'}.\n🎯 Ứng tuyển ngay bằng cách nhắn tin trực tiếp để nhận lịch hẹn phỏng vấn tự động qua AI Agent!\n\n#tuyendung #hr #developer #reactjs #aisaas`,
    linkedin: `Dear Connections, we are excited to expand our AI Agent Product Team!\n\nWe are looking for a key candidate for position **${finalTitle}** with substantial expertise in **${skills || 'React & Node.js'}**.\n\n💼 Working Mode: ${mode}\n💵 Salary package: Up to ${salary || 'negotiable'}\n🚀 Why us? A unique product architecture with true zero-latency AI processors.\n\nApply directly or tag potential top headhunters here. #recruiting #hiring #softwareengineer #vietnamrecruits`,
    vietnamworks: `TUYỂN DỤNG NHÂN SỰ CẤP CAO - ${finalTitle}\n\nChúng tôi dẫn đầu về giải pháp tuyển dụng thông minh.\nYêu cầu kinh nghiệm ứng cử: Trải nghiệm thực tế với ${skills}, hiểu biết hệ thống cloud Firestore.\nCác chế độ bổ sung: 13 tháng lương, khám sức khỏe cao cấp định kỳ hàng năm.`,
    topcv: `[HANOI/HCM] TUYỂN GẤP ${finalTitle}\n- Lương cứng hấp dẫn: ${salary}\n- Chế độ đãi ngộ: Đầy đủ BHXH, thưởng KPIs quý.\n- Kỹ năng yêu cầu: Kỹ thuật tốt về hệ sinh thái ${skills}.\n- Ứng viên gửi CV định dạng PDF để AI Parser của chúng tôi tự động chấm điểm matching.`,
    seo: `Từ khóa: ${finalTitle} tuyển dụng, việc làm ${finalTitle} ${location}, tuyển lập trình viên ${skills}, tuyển dụng ${mode}`
  };
}

function getSimulatedCandidateExtraction(rawText: string, fileName?: string) {
  const cleanName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "Nguyễn Quốc Anh";
  return {
    name: cleanName,
    email: "quocanh.recruitment@gmail.com",
    phone: "0982736152",
    address: "Cầu Giấy, Hà Nội",
    skills: ["ReactJS", "TypeScript", "Tailwind CSS", "Firebase", "Node.js", "Express", "RESTful APIs", "Git"],
    experience: "Hơn 3 năm kinh nghiệm phát triển phần mềm, làm việc tại 2 công ty công nghệ lớn, cấu trúc thành thạo logic SPA frontend.",
    education: "Đại học Bách Khoa Hà Nội - Ngành Khoa học Máy tính",
    languages: ["Tiếng Việt (Bản ngữ)", "Tiếng Anh (IELTS 6.5)"]
  };
}

function getSimulatedCandidateAnalysis(job: any, candidate: any) {
  const matchPercentage = Math.floor(Math.random() * 25) + 70; // 70 to 95%
  const levels = ["Excellent", "Good", "Average"];
  const finalRec = matchPercentage >= 85 ? "Excellent" : "Good";

  return {
    matchingScore: matchPercentage,
    skillsMatch: Math.floor(Math.random() * 20) + 75,
    experienceMatch: Math.floor(Math.random() * 20) + 70,
    salaryMatch: Math.floor(Math.random() * 15) + 80,
    locationMatch: 100,
    summary: `Ứng viên ${candidate.name} là một nhân sự chất lượng cao rất tiềm năng cho vị trí ${job.title}. Kinh nghiệm làm việc thực tiễn phong phú, nắm vững nền tảng kỹ năng chuyên môn cốt lõi và có thể thích ứng nhanh chóng với môi trường dự án SaaS.`,
    strengths: [
      `Thành thạo các kỹ năng kỹ thuật cốt lõi là ${(candidate.skills || []).slice(0, 3).join(', ') || 'React, TypeScript'}`,
      `Có khả năng làm việc độc lập tốt, tư duy logic giải quyết vấn đề hệ thống rõ ràng.`,
      `Trường đại học đào tạo danh tiếng, giao tiếp tự tin và có nền tảng ngoại ngữ phong phú.`
    ],
    weaknesses: [
      `Kinh nghiệm triển khai hệ thống phân tán quy mô lớn (microservices) cần bổ sung thêm.`,
      `Chưa có nhiều kinh nghiệm sâu về cấu hình hạ tầng mạng hạ tầng tự động hóa CI/CD.`
    ],
    missingSkills: [
      `Docker & Kubernetes`,
      `Chương trình bảo mật dữ liệu nâng cao`
    ],
    interviewQuestions: [
      `Hãy mô tả một kiến trúc dự án React mà bạn đã thiết kế tối ưu hiệu năng tốt nhất gần đây?`,
      `Cách thức bạn phối hợp tổ chức công việc khi làm mô hình làm việc từ xa (Remote / Hybrid) là gì?`,
      `Nếu có sự cố xung đột thư viện phần mềm hoặc phiên bản API, quy trình kiểm soát của bạn gồm các bước nào?`
    ],
    recommendation: finalRec
  };
}

function getSimulatedEmail(type: string, candidateName: string, jobTitle: string, company: string) {
  const name = candidateName || "Nguyễn Văn A";
  if (type === "Invitation") {
    return {
      subject: `[${company}] Thư mời phỏng vấn vị trí ${jobTitle}`,
      body: `<p>Thân gửi anh/chị <strong>${name}</strong>,</p>
<p>Cảm ơn anh/chị đã quan tâm ứng tuyển công ty chúng tôi cho vị trí <strong>${jobTitle}</strong>. Qua đánh giá sơ bộ điểm matching từ hệ thống AI Recruitment Agent, chúng tôi rất ấn tượng với profile năng lực chuyên môn của anh/chị.</p>
<p>Chúng tôi trân trọng kính mời anh/chị tham gia buổi phỏng vấn (Vòng 1 - Kỹ thuật) trực tuyến:</p>
<ul>
  <li>Thời gian: Sẽ được điều phối tự động dựa trên thời gian trống của anh/chị qua hệ thống đặt lịch tự động tại trang cá nhân.</li>
  <li>Hình thức: Google Meet hoặc Zoom</li>
</ul>
<p>Vui lòng đăng nhập hệ thống tuyển dụng để bấm chấp thuận và chọn giờ phỏng vấn tiện nhất.</p>
<p>Chúc bạn một tuần làm việc hiệu quả!</p>
<p>Trân trọng,<br/><strong>Bộ phận Nhân sự - ${company}</strong></p>`
    };
  } else if (type === "Rejection") {
    return {
      subject: `[${company}] Phản hồi hồ sơ ứng tuyển vị trí ${jobTitle}`,
      body: `<p>Thân gửi anh/chị <strong>${name}</strong>,</p>
<p>Lời đầu tiên, ban nhân sự thuộc <strong>${company}</strong> xin gửi lời cảm ơn chân thành đến anh/chị vì nỗ lực nộp CV ứng cử vào vị trí ${jobTitle}.</p>
<p>Qua xem xét năng lực và quy mô tuyển dụng hiện tại, chúng tôi nhận thấy các thế mạnh của anh/chị chưa thực sự khớp hoàn hảo với các chỉ tiêu đầu vào cốt lõi khóa này đòi hỏi khắt khe hơn. Vì vậy, chúng tôi rất lấy làm tiếc chưa thể cộng tác cùng anh/chị ở thời điểm hiện tại.</p>
<p>Chúng tôi sẽ lưu hồ sơ của anh/chị tại ATS Database để liên hệ ngay khi có vị trí tương thích mới xuất hiện trong tương lai.</p>
<p>Trân trọng,<br/><strong>Phòng Tuyển Dụng - ${company}</strong></p>`
    };
  } else if (type === "Offer") {
    return {
      subject: `[${company}] Thư mời nhận việc (Offer Letter) - ${jobTitle}`,
      body: `<p>Chào anh/chị <strong>${name}</strong>,</p>
<p>Chúc mừng anh/chị đã hoàn thành xuất sắc các vòng đánh giá phỏng vấn cho vị trí <strong>${jobTitle}</strong> tại công ty <strong>${company}</strong>!</p>
<p>Chúng tôi nồng nhiệt gửi tới anh/chị lời mời gia nhập ngôi nhà chung với mức lương cơ bản hấp dẫn, cơ chế thưởng KPI quý đột phá và gói bảo hiểm sức khỏe chuẩn quốc tế đặc thù.</p>
<p>Rất mong sớm nhận được phản hồi chấp thuận từ phía anh/chị trước thời hạn cuối tuần này để làm hồ sơ tiếp nhận chính thức.</p>
<p>Chúc mừng anh/chị ứng cử thành công!</p>
<p>Thân mến,<br/><strong>Giám đốc Nhân sự - ${company}</strong></p>`
    };
  } else {
    return {
      subject: `[${company}] Nhắc nhở/Cập nhật thông tin tuyển dụng vị trí ${jobTitle}`,
      body: `<p>Thân gửi ứng viên <strong>${name}</strong>,</p>
<p>Chúng tôi gửi thông báo cập nhật nhanh tiến trình xử lý hồ sơ vị trí ${jobTitle} tại công ty ${company}. Chuyên viên của chúng tôi cùng AI Agent đang bổ sung thêm các báo cáo đối sánh năng lực kỹ năng chi tiết của bạn.</p>
<p>Mong sớm được kết nối và làm việc trực tiếp cùng bạn!</p>
<p>Trân trọng,<br/><strong>HR Support Team</strong></p>`
    };
  }
}

function getSimulatedScannedCandidates(job: any) {
  const isTech = !job.title || job.title.toLowerCase().includes('react') || job.title.toLowerCase().includes('developer') || job.title.toLowerCase().includes('kỹ sư') || job.title.toLowerCase().includes('công nghệ');
  
  if (isTech) {
    return [
      {
        name: "Lê Minh Hoàng",
        email: "hoang.le.developer@gmail.com",
        phone: "0382716253",
        address: "Quận 10, TP. Hồ Chí Minh",
        skills: ["React", "TypeScript", "Next.js", "Redux Toolkit", "Tailwind CSS", "Git"],
        experience: "3 năm kinh nghiệm lập trình Frontend tại Teko Vietnam. Chuyên thiết kế UI linh hoạt và tích hợp dịch vụ REST.",
        education: "Đại học Khoa học Tự nhiên - ĐHQG HCM",
        languages: ["Tiếng Việt", "Tiếng Anh (TOEIC 780)"],
        matchScore: 92,
        sourcePlatform: "LinkedIn",
        profileUrl: "https://linkedin.com/in/hoangle-frontdev-mock",
        matchReason: "Ứng viên có kỹ năng cứng cực tốt về React/TypeScript, hiện đang tích cực tìm kiếm cơ hội mới trên LinkedIn. Có 3 năm kinh nghiệm thực chiến hoàn toàn tương thích với yêu cầu vị trí."
      },
      {
        name: "Trần Huy Hoàng",
        email: "huyhoang.codes@outlook.com",
        phone: "0912738910",
        address: "Hà Nội, Việt Nam",
        skills: ["React", "JavaScript", "HTML5/CSS3", "REST API", "Responsive Web Design"],
        experience: "2.5 năm làm việc tại FPT Software. Phát triển ứng dụng Portal Admin và tối ưu tải trang Frontend.",
        education: "Đại học Bách Khoa Hà Nội",
        languages: ["Tiếng Việt", "Tiếng Anh (Giao tiếp tốt)"],
        matchScore: 84,
        sourcePlatform: "GitHub",
        profileUrl: "https://github.com/huyhoangdev-mock",
        matchReason: "Radar phát hiện thông qua các repository chất lượng bằng React trên GitHub. Kỹ thuật coding gọn gàng chuẩn chỉ, giải quyết bài toán giao diện phức tạp nhanh chóng."
      },
      {
        name: "Phạm Khánh Ly",
        email: "khanhly.it96@gmail.com",
        phone: "0967154245",
        address: "Quận Bình Thạnh, TP. Hồ Chí Minh",
        skills: ["React", "TypeScript", "Tailwind CSS", "Bootstrap", "Figma Design"],
        experience: "4 năm làm Frontend Lead & UI Designer tự do. Thiết kế triển khai hơn 15 dự án Web App phức tạp.",
        education: "Đại học Công nghệ thông tin - ĐHQG HCM",
        languages: ["Tiếng Việt", "Tiếng Anh (IELTS 7.0)"],
        matchScore: 88,
        sourcePlatform: "Facebook",
        profileUrl: "https://facebook.com/khanhly.frontend.mock",
        matchReason: "Phát hiện bài đăng tự giới thiệu năng lực trong group 'Cộng đồng ReactJS Việt Nam'. Kinh nghiệm đa năng vừa code tốt vừa thiết kế UI bắt mắt, thích hợp với chế độ làm việc Hybrid của công ty."
      }
    ];
  } else {
    return [
      {
        name: "Nguyễn Thị Phương Thảo",
        email: "phuongthao.recruitment@gmail.com",
        phone: "0972836415",
        address: "Hà Đông, Hà Nội",
        skills: ["Kỹ năng thương lượng", "Tuyển mộ nhân tài", "Lập kịch bản email", "Phỏng vấn sòng phẳng", "Core HR"],
        experience: "6 năm làm chuyên viên Tuyển dụng tại VTI Group. Thiết lập các kịch bản đánh giá năng lực và thu hút ứng viên tài năng.",
        education: "Đại học Kinh tế Quốc dân",
        languages: ["Tiếng Việt", "Tiếng Anh (IELTS 7.5)"],
        matchScore: 94,
        sourcePlatform: "LinkedIn",
        profileUrl: "https://linkedin.com/in/thaophuong-hr-mock",
        matchReason: "Trưởng phòng nhân sự giàu kinh nghiệm trên LinkedIn, sở hữu mạng lưới ứng viên rộng lớn. Kỹ năng quản lý hiệu năng và đàm phán vững vàng, tương thích tuyệt đối với định hướng công ty."
      },
      {
        name: "Đào Duy Anh",
        email: "duyanh.hrconsult@gmail.com",
        phone: "0345678129",
        address: "Cầu Giấy, Hà Nội",
        skills: ["Phỏng vấn chuyên sâu", "Thương lượng lương thưởng", "Headhunting", "Quản lý dữ liệu ứng viên"],
        experience: "4 năm Talent Acquisition Specialist tại OneMount Group. Thiết lập các phễu thu lọc CV quy mô lớn.",
        education: "Đại học Luật Hà Nội",
        languages: ["Tiếng Việt", "Tiếng Anh"],
        matchScore: 81,
        sourcePlatform: "Facebook",
        profileUrl: "https://facebook.com/duyanh.headhunter.mock",
        matchReason: "Thu hoạch từ cộng đồng hỗ trợ tuyển dụng lớn (HR Vietnam). Sở hữu năng lực phỏng vấn và điều phối nhân lực tốt, địa điểm làm việc gần kề với văn phòng công ty."
      }
    ];
  }
}

function getSimulatedPerplexitySearch(query: string) {
  const qLower = query.toLowerCase();
  const isGolangOrJava = qLower.includes('golang') || qLower.includes('go') || qLower.includes('java');
  const isPythonOrAI = qLower.includes('python') || qLower.includes('ai') || qLower.includes('machine') || qLower.includes('data');

  if (isGolangOrJava) {
    return [
      {
        name: "Phạm Quốc Tuấn",
        email: "quoctuan.go@gmail.com",
        phone: "0392817263",
        address: "Quận 1, TP. Hồ Chí Minh",
        skills: ["Go (Golang)", "Docker", "PostgreSQL", "gRPC", "Redis", "Microservices"],
        experience: "4 năm kinh nghiệm làm Backend Developer Go tại VNG Cloud. Thiết kế hệ thống chịu tải cao và đồng bộ Pub/Sub.",
        education: "Đại học Bách Khoa TP.HCM",
        languages: ["Tiếng Việt", "Tiếng Anh (IELTS 6.0)"],
        matchScore: 95,
        sourcePlatform: "LinkedIn",
        profileUrl: "https://linkedin.com/in/quoctuango-mock",
        matchReason: "Công cụ Perplexity Web Search phát hiện profile thông qua các từ khóa Go Developer tại HCM. Thành thục gRPC và Docker phù hợp với các hệ thống backend quy mô lớn."
      },
      {
        name: "Nguyễn Minh Đức",
        email: "minhduc.java@outlook.com",
        phone: "0912384729",
        address: "Hai Bà Trưng, Hà Nội",
        skills: ["Java", "Spring Boot", "Hibernate", "MySQL", "Kubernetes", "Kafka"],
        experience: "5 năm kinh nghiệm backend Spring Boot tại VPBank. Chuyên tối ưu hóa xử lý thanh toán và API banking.",
        education: "Đại học Công nghệ - ĐHQGHN",
        languages: ["Tiếng Việt", "Tiếng Anh (Conversational)"],
        matchScore: 89,
        sourcePlatform: "GitHub",
        profileUrl: "https://github.com/ducjava-backend-mock",
        matchReason: "Tìm thấy từ khoá đóng góp mã nguồn Spring Boot nổi bật tại GitHub. Phù hợp cho thiết kế hạ tầng thanh toán an toàn, bảo mật cao."
      },
      {
        name: "Lê Thị Thuỷ",
        email: "thuythuthi.it@gmail.com",
        phone: "0981726354",
        address: "Đà Nẵng, Việt Nam",
        skills: ["Java", "Go", "Docker", "Spring Boot", "RabbitMQ"],
        experience: "3 năm lập trình Full Stack. Chuyển đổi linh hoạt giữa các dịch vụ microservices Go và Java Spring.",
        education: "Đại học Bách Khoa Đà Nẵng",
        languages: ["Tiếng Việt", "Tiếng Anh"],
        matchScore: 82,
        sourcePlatform: "Perplexity Search",
        profileUrl: "https://linkedin.com/in/thuyle-danang-mock",
        matchReason: "Phát hiện thông tin giới thiệu thành viên tiêu biểu tại Đà Nẵng Tech Group trên Facebook. Am hiểu cả Go lẫn Spring Boot."
      }
    ];
  }

  if (isPythonOrAI) {
    return [
      {
        name: "Vũ Hải Nam",
        email: "hainam.ai@gmail.com",
        phone: "0904817263",
        address: "Hà Đông, Hà Nội",
        skills: ["Python", "PyTorch", "TensorFlow", "FastAPI", "Docker", "Machine Learning", "LLM Tuning"],
        experience: "3 năm làm Machine Learning Engineer tại VinAI Research. Trực tiếp tham gia huấn luyện và tinh chỉnh các mô hình ngôn ngữ lớn (LLM).",
        education: "Đại học Bách Khoa Hà Nội",
        languages: ["Tiếng Việt", "Tiếng Anh (IELTS 7.5)"],
        matchScore: 96,
        sourcePlatform: "GitHub",
        profileUrl: "https://github.com/hainamai-ml-mock",
        matchReason: "Phát hiện thông qua tài khoản GitHub chứa nhiều repo chất lượng về Fine-tuning Llama-3 và RAG pipeline. Kiến thức vượt trội về AI/Deep Learning."
      },
      {
        name: "Nguyễn Hoài Thương",
        email: "hoaithuong.data@outlook.com",
        phone: "0934812739",
        address: "Quận 3, TP. Hồ Chí Minh",
        skills: ["Python", "Pandas", "SQL", "Tableau", "Apache Spark", "Machine Learning"],
        experience: "4 năm làm Data Analyst kiêm Engineer tại Tiki. Xây dựng data pipeline tự động hóa báo cáo kinh doanh nội bộ.",
        education: "Đại học Kinh tế TP.HCM",
        languages: ["Tiếng Việt", "Tiếng Anh (IELTS 6.5)"],
        matchScore: 88,
        sourcePlatform: "LinkedIn",
        profileUrl: "https://linkedin.com/in/thuongnguyen-data-mock",
        matchReason: "Tìm kiếm từ khoá Data Science/Python tại Tiki Hồ Chí Minh. Có kinh nghiệm thực tế về phân tích dữ liệu lớn và triển khai mô hình phán đoán."
      },
      {
        name: "Đỗ Gia Bảo",
        email: "giabao.ai.dev@gmail.com",
        phone: "0962817364",
        address: "Hà Nội, Việt Nam",
        skills: ["Python", "FastAPI", "OpenCV", "NLP", "LangChain"],
        experience: "2.5 năm thiết kế chatbot và các công nghệ thị giác máy tính nhận diện khuôn mặt.",
        education: "Đại học FPT",
        languages: ["Tiếng Việt", "Tiếng Anh (TOEIC 850)"],
        matchScore: 85,
        sourcePlatform: "Perplexity Search",
        profileUrl: "https://linkedin.com/in/giabaodev-mock",
        matchReason: "Phát hiện thông qua bài viết chia sẻ về ứng dụng OpenCV và trí tuệ nhân tạo trên blog cá nhân. Có tư duy sản phẩm AI tốt."
      }
    ];
  }

  return [
    {
      name: "Nguyễn Thế Linh",
      email: "thelinh.tech@gmail.com",
      phone: "0987162534",
      address: "Quận Bình Thạnh, TP. Hồ Chí Minh",
      skills: ["ReactJS", "Node.js", "Express", "MongoDB", "TypeScript", "Tailwind CSS"],
      experience: "3.5 năm phát triển MERN stack. Chuyên nghiệp hóa luồng nghiệp vụ API và tối ưu trải nghiệm client.",
      education: "Đại học CNTT - ĐHQG TPHCM",
      languages: ["Tiếng Việt", "Tiếng Anh (IELTS 6.5)"],
      matchScore: 92,
      sourcePlatform: "LinkedIn",
      profileUrl: "https://linkedin.com/in/thelinhdev-mock",
      matchReason: "Profile tìm kiếm LinkedIn chứa đầy đủ kỹ thuật Stack hiện đại, hoạt động tích cực, điểm đánh giá kỹ năng cao (92%) hoàn toàn khớp yêu cầu tuyển dụng chung."
    },
    {
      name: "Phạm Hà Mi",
      email: "hami.develop@outlook.com",
      phone: "0912635472",
      address: "Cầu Giấy, Hà Nội",
      skills: ["Vue.js", "Nuxt.js", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
      experience: "2 năm xây dựng cổng thông tin doanh nghiệp lớn và đồng bộ dữ liệu. Tối ưu SEO cho Nuxt.",
      education: "Đại học Bách Khoa Hà Nội",
      languages: ["Tiếng Việt", "Tiếng Anh (TOEIC 800)"],
      matchScore: 85,
      sourcePlatform: "GitHub",
      profileUrl: "https://github.com/hamitech-mock",
      matchReason: "Cơ sở mã nguồn mở phong phú tại GitHub. Kỹ năng tư duy giải thuật tối ưu và viết code gọn đẹp theo chuẩn quốc tế."
    },
    {
      name: "Hoàng Minh Quân",
      email: "minhquan.dev99@gmail.com",
      phone: "0961273849",
      address: "Hải Châu, Đà Nẵng",
      skills: ["React Native", "Flutter", "Firebase", "TypeScript", "App Store Publishing"],
      experience: "3 năm lập trình ứng dụng di động cho cả iOS và Android. Đã phát hành thành công 5 app trên store.",
      education: "Đại học Duy Tân",
      languages: ["Tiếng Việt", "Tiếng Anh"],
      matchScore: 87,
      sourcePlatform: "Perplexity Search",
      profileUrl: "https://linkedin.com/in/quanhoang-mobile-mock",
      matchReason: "Phát hiện thông qua bài đăng chia sẻ kinh nghiệm phát hành ứng dụng flutter/firebase tối thiểu hóa chi phí hạ tầng máy chủ."
    }
  ];
}

// Implement Vite middleware integration for Full-Stack Development serving React
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI RECRUITMENT SERVER] running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
}

startServer();
