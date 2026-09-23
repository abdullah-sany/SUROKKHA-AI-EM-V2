import React from 'react';
import { 
  Code2, 
  Sparkles, 
  Heart, 
  Globe, 
  Mail, 
  Award, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  Cpu,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

// Clean SVG Icons for Social Platforms
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterXIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function MeetDeveloper() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  return (
    <div className="min-h-screen bg-[var(--color-off-white)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Top Header Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-100 text-[var(--color-medical-red)] text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? 'উদ্ভাবক ও ডেভেলপার পরিচিতি' : 'Creator & Lead Architect'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-medical-navy)] tracking-tight">
            {isBn ? 'ডেভেলপার পরিচিতি' : 'Meet the Developer'}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-muted-gray)] max-w-2xl mx-auto">
            {isBn 
              ? 'সুরক্ষা এআই বিডি (SUROKKHA AI BD) প্ল্যাটফর্মের মূল উদ্ভাবক, ডিজাইন ও আর্কিটেকচার পেছনের গল্প।' 
              : 'The vision, development journey, and person behind SUROKKHA AI BD.'}
          </p>
        </div>

        {/* Main Developer Profile Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Profile Picture & Social Connect */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-[var(--color-medical-navy)] p-8 sm:p-10 text-white flex flex-col justify-between items-center text-center">
              <div className="w-full flex flex-col items-center">
                
                {/* Developer Avatar with glow & border */}
                <div className="relative mb-6">
                  <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl relative bg-slate-800">
                    <img 
                      src="https://raw.githubusercontent.com/abdullah-sany/Asset/main/Sany.png" 
                      alt="MD Abdullah Sany" 
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-slate-900 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1">
                  MD Abdullah Sany
                </h2>
                <p className="text-sm font-semibold text-teal-300 mb-3 tracking-wide">
                  {isBn ? 'প্রতিষ্ঠাতা ও প্রধান ডেভেলপার' : 'Lead Developer & Founder'}
                </p>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 rounded-full text-xs text-gray-300 mb-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  <span>SUROKKHA AI BD</span>
                </div>

                {/* Direct Email */}
                <a 
                  href="mailto:mdabdulllahsany@gmail.com" 
                  className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-2 border border-white/10 mb-6"
                >
                  <Mail className="w-4 h-4 text-red-400" />
                  <span>mdabdulllahsany@gmail.com</span>
                </a>
              </div>

              {/* Social Connect Links */}
              <div className="w-full pt-6 border-t border-white/10">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                  {isBn ? 'যোগাযোগ ও সোশ্যাল মিডিয়া' : 'Connect With Me'}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a 
                    href="https://github.com/abdullah-sany" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2.5 bg-white/5 hover:bg-white/15 rounded-xl transition-colors text-gray-200"
                  >
                    <GithubIcon className="w-4 h-4 text-teal-300 flex-shrink-0" />
                    <span className="truncate">@abdullah-sany</span>
                  </a>

                  <a 
                    href="https://instagram.com/abdullah_sany_07" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2.5 bg-white/5 hover:bg-white/15 rounded-xl transition-colors text-gray-200"
                  >
                    <InstagramIcon className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    <span className="truncate">@abdullah_sany_07</span>
                  </a>

                  <a 
                    href="https://facebook.com/md.abdullah.sany.07" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2.5 bg-white/5 hover:bg-white/15 rounded-xl transition-colors text-gray-200"
                  >
                    <FacebookIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="truncate">md.abdullah.sany</span>
                  </a>

                  <a 
                    href="https://x.com/ma_sany_01" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2.5 bg-white/5 hover:bg-white/15 rounded-xl transition-colors text-gray-200"
                  >
                    <TwitterXIcon className="w-4 h-4 text-sky-400 flex-shrink-0" />
                    <span className="truncate">@ma_sany_01</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column: Bio, Vision & Technical Story (Supports Bangla & English) */}
            <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between space-y-8 bg-white">
              
              {/* Bio Paragraphs */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-black text-[var(--color-medical-navy)]">
                    {isBn ? 'উদ্ভাবকের বক্তব্য ও অভিজ্ঞতা' : 'Developer Statement'}
                  </h3>
                </div>

                {isBn ? (
                  <>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                      আমি <strong className="text-[var(--color-medical-navy)] font-bold">মোঃ আব্দুল্লাহ সানী</strong>, <strong className="text-[var(--color-medical-red)]">সুরক্ষা এআই (Surokkha AI)</strong>-এর মূল ডেভেলপার ও প্রতিষ্ঠাতা।
                    </p>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      আমি একটি সহজ লক্ষ্য নিয়ে সুরক্ষা এআই তৈরি করেছি — <strong className="text-gray-800">মানুষের যখন সবচেয়ে বেশি প্রয়োজন, ঠিক তখনই জরুরি স্বাস্থ্যসেবার তথ্য যাতে সবচেয়ে সহজে ও দ্রুত তাদের হাতের নাগালে পৌঁছে দেওয়া যায়।</strong>
                    </p>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      একটি জরুরি মুহূর্তে মানুষকে সাধারণত হাসপাতাল, অ্যাম্বুলেন্স, ইমার্জেন্সি হটলাইন, রক্তের সন্ধান কিংবা প্রাথমিক চিকিৎসার নির্দেশনার জন্য বিভিন্ন জায়গায় খোঁজাখুঁজি করতে হয়। আমি বাংলাদেশের মানুষের বাস্তব চাহিদার কথা মাথায় রেখে এই সমস্ত অপরিহার্য সেবাকে একটিমাত্র সহজ ও সমন্বিত প্ল্যাটফর্মে নিয়ে আসতে চেয়েছি।
                    </p>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      সুরক্ষা এআই এমন একটি প্রজেক্ট যা প্রযুক্তি, কৃত্রিম বুদ্ধিমত্তা এবং বাস্তব জীবনের কঠিন সমস্যা সমাধানের প্রতি আমার ভালোবাসাকে একত্রিত করেছে। এটি তৈরির সময় আমি শুধু একটি আধুনিক ওয়েবসাইট বানানোর দিকে নজর দিইনি, বরং এটি যেন বাস্তবিক কোনো জরুরি সংকটেও মানুষের জীবন বাঁচাতে সত্যি কাজে আসে—তা নিশ্চিত করতে চেয়েছি।
                    </p>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      একজন ডেভেলপার হিসেবে এই প্রজেক্টটি আমার শেখার এবং আত্মউন্নয়নের এক অনন্য যাত্রা। ইন্টারফেস ডিজাইন করা থেকে শুরু করে সম্পূর্ণ আর্কিটেকচার তৈরি এবং বিভিন্ন ফিচার নিখুঁতভাবে সংযুক্ত করা—প্রতিটি ধাপেই একটি ধারণাকে কার্যকর ও ব্যবহারযোগ্য সমাধানে রূপ দেওয়ার সর্বাত্মক চেষ্টা করেছি।
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal">
                      I’m <strong className="text-[var(--color-medical-navy)] font-bold">MD Abdullah Sany</strong>, the developer behind <strong className="text-[var(--color-medical-red)]">Surokkha AI</strong>.
                    </p>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      I created Surokkha AI with a simple goal — <strong className="text-gray-800">to make emergency healthcare information easier to access when people need it the most.</strong>
                    </p>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      In an emergency, people often have to search in different places for hospitals, ambulances, emergency contacts, blood support, or basic health guidance. I wanted to bring these essential resources together into one simple platform designed with the needs of people in Bangladesh in mind.
                    </p>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Surokkha AI is a project that combines my interest in technology, AI, and real-world problem solving. While building it, I focused not only on making a modern website, but also on creating something that could be useful in an actual emergency situation.
                    </p>

                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      This project is also a part of my learning journey as a developer. From designing the interface to developing the system and connecting its different features, I built Surokkha AI with the intention of turning an idea into a real, working solution.
                    </p>
                  </>
                )}
              </div>

              {/* Vision Highlight Card */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border border-red-100 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 pointer-events-none">
                  <Heart className="w-24 h-24 text-red-600" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-medical-red)] mb-2">
                  {isBn ? 'আমার ভিশন' : 'My Vision'}
                </h4>
                <blockquote className="text-base sm:text-lg font-bold text-[var(--color-medical-navy)] italic leading-snug mb-3">
                  {isBn 
                    ? '“প্রযুক্তি কেবল উদ্ভাবনী হলেই চলবে না — মানুষের চরম প্রয়োজনের মুহূর্তে যেন তা বাস্তবে কার্যকর ও সহায়ক হতে পারে।”'
                    : '“Technology should not only be innovative — it should be useful when people need it most.”'}
                </blockquote>
                <p className="text-xs sm:text-sm text-gray-600">
                  {isBn
                    ? 'আমি আশা করি সুরক্ষা এআই আরও সমৃদ্ধ হবে এবং সারা বাংলাদেশের মানুষের জন্য একটি নির্ভরযোগ্য ও কার্যকর জরুরি স্বাস্থ্যসেবা প্ল্যাটফর্মে পরিণত হবে।'
                    : 'I hope Surokkha AI can continue to grow into a more reliable and helpful emergency healthcare platform for people across Bangladesh.'}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* Technical Architecture & Proof of Development */}
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-teal-50 text-[var(--color-medical-teal)] rounded-xl flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[var(--color-medical-navy)]">
                {isBn ? 'টেকনিক্যাল স্ট্যাক ও আর্কিটেকচার হাইলাইটস' : 'Technical Stack & Architecture Highlights'}
              </h3>
              <p className="text-xs text-gray-500">
                {isBn ? 'মোঃ আব্দুল্লাহ সানী কর্তৃক উদ্ভাবিত ও ডেভেলপকৃত' : 'Engineered from the ground up by MD Abdullah Sany'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">{isBn ? 'ফ্রন্টএন্ড ও রাউটিং' : 'Frontend & Routing'}</div>
              <p className="text-sm font-bold text-gray-800">React 18 + TypeScript + Vite</p>
              <p className="text-xs text-gray-500 mt-1">{isBn ? 'টেইলউইন্ড সিএসএস, লুসিড আইকন এবং বাংলা ও ইংরেজি পূর্ণ দ্বিভাষিক ইঞ্জিন' : 'Tailwind CSS, Lucide Icons, Bilingual Engine (Bangla & English)'}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">{isBn ? 'ম্যাপিং ও ট্রায়াজ' : 'Mapping & Triage'}</div>
              <p className="text-sm font-bold text-gray-800">Leaflet + OpenStreetMap + OSRM</p>
              <p className="text-xs text-gray-500 mt-1">{isBn ? 'রিয়েল-টাইম ড্রাইভিং দূরত্ব, গ্রাফ নেভিগেশন ও জিপিএস ইমার্জেন্সি ট্রায়াজ' : 'Real-time driving distance, graph navigation & GPS triage'}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase mb-1">{isBn ? 'অফলাইন ও ক্লাউড সিঙ্ক' : 'Offline & Cloud Sync'}</div>
              <p className="text-sm font-bold text-gray-800">IndexedDB + Firebase Firestore</p>
              <p className="text-xs text-gray-500 mt-1">{isBn ? 'জিরো-ইন্টারনেট ম্যাপ টাইল ক্যাশিং এবং রিয়েল-টাইম অ্যাডমিন ডাটাবেস' : 'Zero-connectivity tile caching and real-time admin sync'}</p>
            </div>
          </div>
        </div>

        {/* Bottom CTA to explore app */}
        <div className="text-center pt-4">
          <Link
            to="/emergency"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-[var(--color-medical-red)] hover:bg-red-700 text-white rounded-2xl font-black text-sm tracking-wide shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <span>{isBn ? 'জরুরি সেবা পরীক্ষা করুন' : 'Test Emergency Hub'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
