import Typography from "@mui/material/Typography";
import { Box } from "@mui/system";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
// Topics shown in the topic dropdown.
// `value` is sent to the API as the `category` parameter, so it must be one of NewsData.io's category names.
// `label` is the text the user sees.
const CATEGORIES = [
  { value: "world", label: "World" },
  { value: "politics", label: "Politics" },
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "science", label: "Science" },
  { value: "health", label: "Health" },
  { value: "sports", label: "Sports" },
  { value: "entertainment", label: "Entertainment" },
  { value: "environment", label: "Environment" },
  { value: "education", label: "Education" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "crime", label: "Crime" },
];

// Languages shown in the language dropdown.
// `value` is the 2-letter ISO 639-1 language code sent to the API as the `language` parameter.
// `label` is the language's own name, written in that language, so every reader can find theirs.
// To support another language, add one line to this list.
const LANGUAGES = [
  { value: "ar", label: "العربية" },     // Arabic (right-to-left)
  { value: "en", label: "English" },
  { value: "tr", label: "Türkçe" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "ru", label: "Русский" },
  { value: "ur", label: "اردو" },        // Urdu (right-to-left)
];

function Header(props) {
  // `language` and `onLanguageChange` are new: the selected language and the function to call when it changes.
  const { onSearchChange,onCategoryChange,category,language,onLanguageChange } = props;
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            News Feed App
          </Typography>

          <FormControl size="small">
            <Paper sx={{ display: "flex", alignItems: "center" }}>
              <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
                <SearchIcon />
              </IconButton>

              <InputBase
                sx={{ ml: 1, flex: 1 }}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search"
              />
            </Paper>
          </FormControl>
          <Box sx={{ flexGrow: 1 }} />

          {/* Language dropdown (new). Same pattern as the topic dropdown below:
              `value` shows the current language, `onChange` tells NewsFeed the user picked another one. */}
          <Paper sx={{ marginInlineEnd: 2 }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={language} onChange={onLanguageChange} aria-label="Language">
                {/* One menu item per language in the LANGUAGES list above */}
                {LANGUAGES.map((l) => (
                  <MenuItem key={l.value} value={l.value}>
                    {l.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>

          <Paper>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={category}
                onChange={onCategoryChange}
                displayEmpty
              >
                <MenuItem value="">All</MenuItem>
                {CATEGORIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Header;