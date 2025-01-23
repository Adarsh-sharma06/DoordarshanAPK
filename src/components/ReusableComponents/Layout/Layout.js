import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useNavigate } from "react-router-dom";

const Layout = ({ title, logoSrc, logoText, menuSections, profileImg, profileName }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const toggleSidebar = (open) => () => {
    setIsSidebarOpen(open);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const SidebarContent = (
    <Box sx={{ width: 280, backgroundColor: "#f9f9f9", height: "100%" }}>
      {/* Logo Section */}
      <Box sx={{ textAlign: "center", py: 2, borderBottom: "1px solid #ddd" }}>
        <img src={logoSrc} alt="Logo" style={{ width: 50, height: 50 }} />
        <Typography variant="h6" sx={{ mt: 1, fontWeight: "bold" }}>
          {logoText}
        </Typography>
      </Box>

      {/* Menu Section */}
      <List>
        {menuSections.map((section, index) => (
          <React.Fragment key={index}>
            {section.heading && (
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ px: 2, mt: 2, textTransform: "uppercase" }}
              >
                {section.heading}
              </Typography>
            )}
            {section.items.map((item, itemIndex) => (
              <NavLink
                to={item.link}
                key={itemIndex}
                style={{ textDecoration: "none" }}
                end
              >
                <ListItem button>
                  {item.icon && (
                    <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
                  )}
                  <ListItemText primary={item.name} />
                </ListItem>
              </NavLink>
            ))}
            <Divider sx={{ my: 1 }} />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Navbar */}
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left Section */}
          {isMobile && (
            <IconButton color="inherit" onClick={toggleSidebar(true)}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {title}
          </Typography>

          {/* Right Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {profileImg ? (
              <IconButton onClick={handleMenuOpen}>
                <Avatar src={profileImg} alt={profileName} />
              </IconButton>
            ) : (
              <IconButton onClick={handleMenuOpen}>
                <AccountCircleIcon />
              </IconButton>
            )}
          </Box>

          {/* Profile Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => handleNavigate("/profile")}>Profile</MenuItem>
            <MenuItem onClick={() => handleNavigate("/settings")}>Settings</MenuItem>
            <MenuItem onClick={() => handleNavigate("/logout")} sx={{ color: "red" }}>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        anchor="left"
        open={isSidebarOpen}
        onClose={toggleSidebar(false)}
        variant={isMobile ? "temporary" : "persistent"}
        sx={{
          "& .MuiDrawer-paper": { width: 280, backgroundColor: "#f9f9f9" },
        }}
      >
        {SidebarContent}
      </Drawer>
    </>
  );
};

Layout.propTypes = {
  title: PropTypes.string.isRequired,
  logoSrc: PropTypes.string,
  logoText: PropTypes.string,
  menuSections: PropTypes.arrayOf(
    PropTypes.shape({
      heading: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          link: PropTypes.string.isRequired,
          icon: PropTypes.elementType,
        })
      ),
    })
  ).isRequired,
  profileImg: PropTypes.string,
  profileName: PropTypes.string,
};

Layout.defaultProps = {
  logoSrc: "/images/DD.png",
  logoText: "Doordarshan",
  profileImg: null,
  profileName: "",
  menuSections: [
    {
      heading: "Main",
      items: [
        { name: "Home", link: "/", icon: HomeIcon },
        { name: "Profile", link: "/profile", icon: AccountCircleIcon },
      ],
    },
    {
      heading: "Settings",
      items: [
        { name: "Settings", link: "/settings", icon: SettingsIcon },
        { name: "Logout", link: "/logout", icon: LogoutIcon },
      ],
    },
  ],
};

export default Layout;
