import { useState } from "react"
import translations from "../utils/i18n"

const InfoPage = () => {
  const [lang, setLang] = useState("en")
  const t = translations[lang]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === "en" ? "am" : "en")}
            className="px-4 py-2 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow"
          >
            {lang === "en" ? "አማርኛ" : "English"}
          </button>
        </div>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">{t.title}</h1>
        <p className="mb-4 text-gray-700 text-lg">{t.intro}</p>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>{t.tip1}</li>
          <li>{t.tip2}</li>
          <li>{t.tip3}</li>
        </ul>
      </div>
    </div>
  )
}

export default InfoPage 