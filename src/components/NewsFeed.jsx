import NewsArticle from "./NewsArticle";
import Header from "./Header";
import { Box } from "@mui/system";
import Stack from "@mui/material/Stack";
import { useEffect, useState, useRef, useMemo } from "react";
import Typography from "@mui/material/Typography";
import { debounce } from "lodash";
import Button from "@mui/material/Button";
import LoadingArticles from "./LoadingArticles";

// NewsData.io's free plan returns at most 10 articles per request, so a page holds 10 articles.
const PAGE_SIZE = 10;
// Languages written from right to left. For these, the whole feed is flipped with dir="rtl".
const RTL_LANGUAGES = ["ar", "ur", "fa", "he"];
// The language selected when the app opens. Change "ar" to "en" (or any code in LANGUAGES) if you prefer.
const DEFAULT_LANGUAGE = "ar";

function NewsFeed() {
  const [articles, setArticle] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]= useState("")
  const [category, setCategory] = useState("")
  const categoryRef = useRef("")
  const controllerRef =
    useRef(null); /** لكي يحتفظ بحالة الcontroller حتى يتسطيع أن يلغي السابق */
  // 🗑️ حُذف: const controller = new AbortController();
  // السبب: كان يُنشأ من جديد في كل render ولا أحد يستعمله، والـ controller الحقيقي
  // صار يُنشأ عند كل طلب ويُحفظ في controllerRef
 const OffsetRef = useRef(0)
 const queryValue = useRef("")
 // ==================== LANGUAGE + PAGING (added) ====================
 // `language` (state) drives the language dropdown and the text direction, so changing it re-renders the screen.
 const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
 // `languageRef` holds the same value for the debounced function, exactly like categoryRef does for the category.
 const languageRef = useRef(DEFAULT_LANGUAGE)
 // NewsData.io pages with a "nextPage" token instead of page numbers. We remember the token of every page we
 // have reached: pageTokensRef.current[0] is page 1 (no token), [1] is the token for page 2, and so on.
 // This lets "Previous" go back by reusing the token we saved on the way forward.
 const pageTokensRef = useRef([undefined])
 // ================== END LANGUAGE + PAGING ==================

  useEffect(() => {
    // ➕ إضافة: controller خاص بالطلب الأول، نحفظه في الـ ref ليستطيع OnSearchHandler إلغاءه
    const controller = new AbortController();
    controllerRef.current = controller;
    setError("")
    setLoading(true);
    // ✏️ تعديل: نمرر signal لـ loadData
    loadData("", controller.signal,OffsetRef.current,categoryRef.current,languageRef.current) // ✏️ + language
      .then((newData) => {
        setArticle(newData);
        setLoading(false);
      })
      // ➕ إضافة: الطلب الملغى يرمي AbortError وهو ليس خطأ حقيقياً فنتجاهله
      // (لا نغلق الـ spinner لأن الطلب الأحدث سيتولى ذلك)
      .catch((err) => {
          if (err.name === "AbortError") return; //
          setError(err.message)
          setLoading(false);

      });

    // ➕ إضافة: تنظيف عند إزالة المكوّن: نلغي الطلب الجاري ونلغي أي debounce معلّق
    return () => {
      controller.abort();
      debouncedAPICall.cancel();
    };
  }, []);

  /**فكرة تقليل  طلبات للحصول على الداتا */
  // ✏️ تعديل: غلّفناه بـ useMemo حتى يبقى مؤقت واحد بين الـ renders،
  // وبدونه يُنشأ debounce جديد في كل render فلا يُعاد ضبط أي شيء
  const debouncedAPICall = useMemo(
    () =>
      debounce(() => {
        // ➕ إضافة: controller جديد لهذا الطلب، ونحفظه في الـ ref
        // (الطلب السابق أُلغي أصلاً عند الكتابة، وهذا السطر احتياط)
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setError("")
        setLoading(true);
        // ✏️ تعديل: نمرر signal الخاص بهذا الطلب
        loadData(queryValue.current, controller.signal,OffsetRef.current,categoryRef.current,languageRef.current) // ✏️ + language
          .then((newData) => {
            setArticle(newData);
            setLoading(false);
          })
          // ➕ إضافة: نتجاهل الإلغاء المقصود، ونعالج الأخطاء الحقيقية فقط
          .catch((err) => {
             if (err.name === "AbortError") return; //
             setError(err.message)
             setLoading(false);
            });
      }, 500),
    [] // ✏️ تعديل: مصفوفة فارغة = تُنشأ النسخة مرة واحدة فقط
  );

  const OnSearchHandler = (newQuery) => {
    queryValue.current=newQuery
    // ➕ إضافة (أهم سطر): نلغي أي طلب جارٍ فوراً مع كل حرف يكتبه المستخدم،
    // دون انتظار انتهاء الـ debounce. هذا هو المطلوب: طلب جديد قادم = القديم يُلغى
    controllerRef.current?.abort();
    OffsetRef.current = 0
    debouncedAPICall();
    // 🗑️ حُذف: controllerRef;  (سطر لا يفعل شيئاً)
  };

 const OnCategoryHandler = (event) => {
  const value = event.target.value
  setCategory(value)
  categoryRef.current = value
  OffsetRef.current = 0
  controllerRef.current?.abort();
  debouncedAPICall()
}
 // ==================== LANGUAGE HANDLER (added) ====================
 // Runs when the user picks a language. Same 6 steps as OnCategoryHandler above.
 const OnLanguageHandler = (event) => {
  const value = event.target.value   // the chosen code, e.g. "ar"
  setLanguage(value)                 // update the dropdown and the text direction (re-render)
  languageRef.current = value        // make the new language visible to the debounced request
  OffsetRef.current = 0              // a new language starts again from page 1
  controllerRef.current?.abort();    // cancel any request still loading in the old language
  debouncedAPICall()                 // load the news in the new language
}
 // ================== END LANGUAGE HANDLER ==================
  /** كل ما ال debouncedAPCall يتغير
   * 1- cancel the previous requests
   * 2- keep the last request
   */
  // 🗑️ حُذف: let currentController= null;
  // السبب: كان يُصفَّر في كل render فلا يحتفظ بشيء، واستبدلناه بـ controllerRef
  // ==================== NEWS SOURCE: NewsData.io (90+ languages, including Arabic) ====================
  // Fetches one page of articles. Output is the SAME shape as before
  // ({ author, title, description, url, image, publishedAt }), so the cards did not need to change.
  // New 5th input: `language`, a 2-letter code such as "ar", "en" or "tr".
  async function loadData(query, signal, offset, category, language) {
  // Read the free API key from the .env file (Vite exposes variables that start with VITE_ via import.meta.env).
  const apiKey = import.meta.env.VITE_NEWSDATA_API_KEY;
  // No key -> stop here with a clear message, instead of sending a request that is sure to fail.
  // Throwing inside an async function rejects its promise, so your existing .catch() shows this message on screen.
  if (!apiKey) {
    throw new Error("Missing API key: add VITE_NEWSDATA_API_KEY=your-key to the .env file (free at newsdata.io), then restart npm run dev.")
  }

  // Which page are we on? offset 0 -> page 0, offset 10 -> page 1, offset 20 -> page 2...
  const pageIndex = offset / PAGE_SIZE;

  // URLSearchParams builds the "?key=value&..." part of the URL and safely encodes Arabic letters, spaces and symbols.
  const params = new URLSearchParams({
    apikey: apiKey,                 // your key
    language: language,             // only articles written in this language
    size: String(PAGE_SIZE),        // 10 articles per page (the free-plan maximum)
  });
  // Add the topic only when one is selected ("" means "All").
  if (category) params.set("category", category);
  // Add the search words only when the box isn't empty. Arabic search words work as-is.
  if (query) params.set("q", query);
  // Page 1 needs no token. For later pages, send the token we saved when the previous page loaded.
  const pageToken = pageTokensRef.current[pageIndex];
  if (pageToken) params.set("page", pageToken);

  // The full request URL, e.g. https://newsdata.io/api/1/latest?apikey=...&language=ar&size=10
  const url = `https://newsdata.io/api/1/latest?${params}`;
  // `signal` links this request to its AbortController, so controllerRef.current.abort() can cancel it.
  const response = await fetch(url, { signal });

  /**handle the api call blocked or internet switched off */
  // Read the JSON body. NewsData.io also sends JSON for errors (with a message), so we read it either way.
  // `.catch(() => null)` keeps us safe if the body isn't valid JSON (for example an HTML error page).
  const data = await response.json().catch(() => null);
  // Success means HTTP OK *and* status "success" in the body. Otherwise show the API's own message if it has one.
  if (!response.ok || data?.status !== "success") {
    throw new Error(data?.results?.message || `Could not load the news (HTTP ${response.status}). Please try again later.`)
  }

  // Save the token for the NEXT page (null when there are no more pages). Next uses it; Previous reuses older ones.
  pageTokensRef.current[pageIndex + 1] = data.nextPage ?? null;

  // Convert each NewsData.io article into the shape our NewsArticle card expects.
  return (data.results ?? []).map((item) => ({
    // `creator` is a list of authors (or null). Use the first one, otherwise the news site's name.
    author: item.creator?.[0] ?? item.source_name ?? "",
    title: item.title,                          // headline
    description: item.description ?? "",        // short summary ("" if missing)
    url: item.link,                             // link to the original article
    image: item.image_url ?? null,              // image URL; null hides the image in the card
    // pubDate looks like "2026-11-23 08:15:00" (UTC, with a space). Turning it into "2026-11-23T08:15:00Z"
    // makes every browser (including Safari) read it correctly as a UTC date.
    publishedAt: item.pubDate ? item.pubDate.replace(" ", "T") + "Z" : null,
  }));
}
// ================== END NEWS SOURCE ==================
 const onNextPressHandler=()=>{
  if(OffsetRef.current >=0){

     OffsetRef.current+=PAGE_SIZE
  }else{
    OffsetRef.current=0

  }
 controllerRef.current?.abort();
 debouncedAPICall()


 }
 const onPrevPressHandler=()=>{
  if(OffsetRef.current > 0){

  OffsetRef.current-=PAGE_SIZE

  }else{
      OffsetRef.current = 0

  }
controllerRef.current?.abort();
debouncedAPICall()
 }
  return (

    // dir="rtl" flips the layout and text for right-to-left languages (Arabic, Urdu...), dir="ltr" for the others.
    <Box sx={{ width: 900, mx: "auto" }} dir={RTL_LANGUAGES.includes(language) ? "rtl" : "ltr"} lang={language}>
      {/* ✏️ added language + onLanguageChange so the header can show and change the language */}
      <Header onSearchChange={OnSearchHandler} onCategoryChange ={OnCategoryHandler} category={category} language={language} onLanguageChange={OnLanguageHandler}/>
      {error.length ? (
         <Typography
          color="error"
          sx={{
            marginTop: 4,
            marginBottom: 4,
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
         {error}
        </Typography>

      ):null}
      {loading ? (
         [...Array(5)].map((_, i)=>(<LoadingArticles key={i}/>)))
         :!loading&&articles.length ? (
        articles.map((article,i) => (
          <NewsArticle key={`${article.url}-${i}`} {...article} />
        ))
      ) :!loading && !articles.length ?
        (<Typography
          variant="h6"
          component="div"
          color="textSecondary"
          sx={{
            marginTop: 4,
            marginBottom: 4,
            display: "flex",
            alignContent: "center",
            justifyContent: "center"}}>
             No articles found.
        </Typography>):null}
      <Stack  sx={{ display: "flex", flexDirection:"row",justifyContent:"center",columnGap:40, alignContent:"center",alignItems:"center" }}>
        <Button variant="outlined" onClick={onPrevPressHandler} disabled={loading|| OffsetRef.current==0}>Previous </Button>
        {/* ✏️ Next is also disabled when the API gave no token for the next page (= this is the last page) */}
        <Button variant="outlined" onClick={onNextPressHandler} disabled={loading || articles.length < PAGE_SIZE || !pageTokensRef.current[OffsetRef.current / PAGE_SIZE + 1]}>Next</Button>
      </Stack>
    </Box>
  );
}

export default NewsFeed;