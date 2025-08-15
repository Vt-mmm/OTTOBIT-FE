import { useNavigate } from "react-router-dom";
// @mui
import {
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
// redux
import { useAppDispatch } from "reduxStore/config";
import { setStatus } from "reduxStore/auth/authSlice";
//
import { NavItem as NavItemInterface } from "common/@types";
import { StorageKeys } from "constants/storageKeys";
import { removeLocalStorage } from "utils";

const StyledNavItemIcon = styled(ListItemIcon)({
  width: 22,
  height: 22,
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

interface NavItemProps {
  item: NavItemInterface;
}

function NavItem({ item }: NavItemProps) {
  const { title, path, icon } = item;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  return (
<ListItemButton
  disableGutters

  onClick={() => {
    navigate(path);
    dispatch(setStatus());
    removeLocalStorage(StorageKeys.PAGE);
    removeLocalStorage(StorageKeys.ROW_PER_PAGE);
  }}
>
  <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>
  <ListItemText disableTypography primary={title} />
</ListItemButton>
  );
}

interface NavSectionProps {
  data: NavItemInterface[];
}

function NavSection({ data = [], ...other }: NavSectionProps) {
  return (
    <Box {...other}>
      <Stack spacing={1}>
        {data.map((item, index) => (
          <NavItem key={index} item={item} />
        ))}
      </Stack>
    </Box>
  );
}

export default NavSection;
