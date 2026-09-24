# گزارش تحقیق و تصمیم‌های فنی نسخهٔ ۳

## ۱. چرا صدای زن در نسخه‌های قبل هیچ دیالوگی نمی‌گفت (ریشه‌یابی از کد شما)
- `server.ts` برای صدا دستور `/usr/local/bin/piper -m models/piper/fa_IR-gyro-medium.onnx` را اجرا می‌کرد. در بستهٔ شما فقط `fa_IR-gyro-medium.onnx.json` هست و **فایل مدل `.onnx` (حدود ۶۳ مگ) وجود ندارد**؛ برنامهٔ `piper` هم روی محیط AI Studio نصب نیست. نتیجه: هر درخواست صدا شکست می‌خورد.
- `OfflineNeuralTTSProvider.ts` این صدا را «Sara، زن» معرفی کرده بود، ولی کارت رسمی مدل gyro می‌گوید روی **دیتاست مردانه** آموزش دیده است.
- صدای مرورگر (Web Speech) داخل MediaRecorder ضبط نمی‌شود، پس حتی وقتی کار می‌کرد، داخل ویدیو نمی‌رفت.

## ۲. گزینه‌های صدای زن فارسی (بررسی‌شده)
| گزینه | زن؟ | آفلاین در مرورگر؟ | لحن/احساس | نتیجه |
|---|---|---|---|---|
| Gemini TTS (`gemini-2.5-flash-preview-tts`) | بله، صداهای Leda، Aoede، Zephyr، Kore و … | ساخت آنلاین، پخش آفلاین از بانک صدا | با دستور متنی کنترل می‌شود | **انتخاب اصلی** |
| OpenAI `gpt-4o-mini-tts` | coral، nova، shimmer، sage | ساخت آنلاین، پخش آفلاین | پارامتر `instructions` | جایگزین |
| Piper فارسی (amir، ganji، gyro، reza_ibrahim) | خیر، همه مردانه | بله (WASM) | ندارد | فقط اضطراری |
| Khadijah (Matcha-TTS، sherpa-onnx) | بله | فقط با ساخت WASM سفارشی + vocoder، حدود ۸۰ مگ | ندارد | برای نسخهٔ بعد |
| ManaTTS / Ava-82M | صدای زن | فقط Python/PyTorch | محدود | برای مرورگر آماده نیست |
| Web Speech (صدای سیستم) | بستگی به دستگاه دارد | بله | ندارد | **داخل ویدیو ضبط نمی‌شود** |

**تصمیم:** «بانک صدا». هر خط یک بار با لحن مخصوص خودش ساخته و در IndexedDB (ذخیرهٔ دائمی) و/یا پوشهٔ `voices/` کنار اپ نصب می‌شود. پخش آنی و بدون اینترنت است، از مسیر Web Audio داخل ویدیو ضبط می‌شود و زیرنویس کلمه‌به‌کلمه با طول واقعی صدا هم‌زمان می‌شود.

## ۳. منابع
- Gemini speech generation: https://ai.google.dev/gemini-api/docs/speech-generation (خروجی PCM ۲۴kHz، ۱۶ بیت، مونو. فارسی `fa` پشتیبانی می‌شود)
- OpenAI TTS: https://platform.openai.com/docs/guides/text-to-speech
- Piper voices: https://github.com/rhasspy/piper/blob/master/VOICES.md · gyro model card: https://huggingface.co/rhasspy/piper-voices/blob/main/fa/fa_IR/gyro/medium/MODEL_CARD
- Khadijah female Persian Matcha: https://huggingface.co/mah92/Khadijah-FA_EN-Matcha-TTS-Model · https://github.com/k2-fsa/sherpa-onnx/issues/1779
- ManaTTS: https://aclanthology.org/2025.naacl-long.464/
- Piper در مرورگر: https://github.com/Mintplex-Labs/piper-tts-web · sherpa-onnx WASM: https://k2-fsa.github.io/sherpa/onnx/tts/wasm/index.html
- MediaRecorder / captureStream: https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/captureStream
- Web Speech getVoices: https://developer.mozilla.org/docs/Web/API/SpeechSynthesis/getVoices
- تنظیمات آپلود یوتیوب: https://support.google.com/youtube/answer/1722171 (1080p60 حدود ۱۲ مگابیت، 1440p60 حدود ۲۴ مگابیت؛ این اپ بالاتر از این مقدارها ضبط می‌کند)
- Service Worker و نصب آفلاین: https://web.dev/learn/pwa/

## ۴. ضبط برای یوتیوب
- بوم رندر ۱۹۲۰×۱۰۸۰ منطقی است و با 1080p، 1440p یا 4K واقعی رندر می‌شود (همه‌چیز برداری است، پس کیفیت کم نمی‌شود).
- اولویت کدک: MP4/H.264 + AAC (کروم و اج جدید، سافاری) و در غیر این صورت WebM/VP9 + Opus. هر دو را یوتیوب مستقیم قبول می‌کند.
- بیت‌ریت: 1080p60 ≈ ۲۱ مگابیت، 1440p60 ≈ ۴۲ مگابیت، 4K60 ≈ ۶۵ مگابیت. صدا ۳۲۰ کیلوبیت، ۴۸kHz، با کمپرسور و لیمیتر (سقف ‎-1.5 dBFS).
- کنار هر ضبط یک فایل زیرنویس SRT فارسی با زمان‌بندی دقیق ساخته می‌شود.

## ۵. تایپوگرافی
فونت‌ها داخل اپ هستند و به اینترنت نیاز ندارند: Lalezar (نمایشی سنگین، شبیه تیترهای تلویزیونی)، Estedad، Vazirmatn، Noto Kufi Arabic، Marhey. متن‌ها با خط دور ضخیم، سایهٔ عمق چندلایه و درخشش رنگ تم رندر می‌شوند (سبک تیترهای MrBeast). زیرنویس دوخطی متوازن می‌شود و کلمه‌به‌کلمه هم‌زمان با صدا روشن می‌شود.
