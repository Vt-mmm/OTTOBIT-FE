import { IconButton, Menu, MenuItem, Box, Typography } from "@mui/material";
import { Language as LanguageIcon } from "@mui/icons-material";
import { useState, MouseEvent } from "react";
import { useLocales } from "hooks";
import { Language } from "common/enums/language.enum";

export default function LanguageSwitcher() {
  const { currentLang, onChangeLang } = useLocales();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang: Language) => {
    onChangeLang(lang);
    handleClose();
  };

  return (
    <Box>
      <IconButton
        id="language-button"
        aria-controls={open ? "language-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          color: "#22c55e",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          "&:hover": {
            backgroundColor: "white",
          },
        }}
      >
        <LanguageIcon />
        <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>
          {currentLang.toUpperCase()}
        </Typography>
      </IconButton>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "language-button",
        }}
      >
        <MenuItem
          onClick={() => handleLanguageChange(Language.VI)}
          selected={currentLang === Language.VI}
        >
          Tiếng Việt
        </MenuItem>
        <MenuItem
          onClick={() => handleLanguageChange(Language.EN)}
          selected={currentLang === Language.EN}
        >
          English
        </MenuItem>
      </Menu>
    </Box>
  );
}
