// @mui icons
import DashboardIcon from "@mui/icons-material/Dashboard";
// Removed Map-specific icons; using QuizIcon to represent Challenge
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import MapIcon from "@mui/icons-material/Map";
import PersonIcon from "@mui/icons-material/Person";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SecurityIcon from "@mui/icons-material/Security";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MemoryIcon from "@mui/icons-material/Memory";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import DescriptionIcon from "@mui/icons-material/Description";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { PATH_ADMIN, PATH_USER } from "routes/paths";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import { useLocales } from "hooks";

function useConfigSidebar() {
  const { translate } = useLocales();

  const navAdmin = [
    {
      missions: translate("admin.sidebar.overview"),
      listNav: [
        {
          title: translate("admin.sidebar.dashboard"),
          path: PATH_ADMIN.dashboard,
          icon: <DashboardIcon fontSize="small" />,
        },
      ],
    },
    {
      missions: translate("admin.sidebar.tools"),
      listNav: [
        {
          title: translate("admin.sidebar.challengeDesigner"),
          path: PATH_ADMIN.challengeDesigner,
          icon: <QuizIcon fontSize="medium" />,
        },
        {
          title: translate("admin.sidebar.mapDesigner"),
          path: PATH_ADMIN.mapDesigner,
          icon: <MapIcon fontSize="medium" />,
        },
      ],
    },
    {
      missions: translate("admin.sidebar.contentManagement"),
      listNav: [
        {
          title: translate("admin.sidebar.courseManagement"),
          path: PATH_ADMIN.courseManagement,
          icon: <SchoolIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.lessonManagement"),
          path: PATH_ADMIN.lessonManagement,
          icon: <MenuBookIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.lessonResourceManagement"),
          path: PATH_ADMIN.lessonResourceManagement,
          icon: <CollectionsBookmarkIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.challengeManagement"),
          path: PATH_ADMIN.challengeManagement,
          icon: <QuizIcon fontSize="small" />,
        },

        {
          title: translate("admin.sidebar.mapManagement"),
          path: PATH_ADMIN.mapManagement,
          icon: <MapIcon fontSize="medium" />,
        },
        {
          title: translate("admin.sidebar.robotManagement"),
          path: PATH_ADMIN.robotManagement,
          icon: <SmartToyIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.componentManagement"),
          path: PATH_ADMIN.componentManagement,
          icon: <MemoryIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.activationCodeManagement"),
          path: PATH_ADMIN.activationCodeManagement,
          icon: <ConfirmationNumberIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.certificateManagement"),
          path: PATH_ADMIN.certificateManagement,
          icon: <CardMembershipIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.certificateTemplateManagement"),
          path: PATH_ADMIN.certificateTemplateManagement,
          icon: <DescriptionIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.voucherManagement"),
          path: PATH_ADMIN.voucherManagement,
          icon: <LocalOfferIcon fontSize="small" />,
        },
      ],
    },
    {
      missions: translate("admin.sidebar.userManagement"),
      listNav: [
        {
          title: translate("admin.sidebar.studentManagement"),
          path: PATH_ADMIN.studentManagement,
          icon: <PersonIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.enrollmentManagement"),
          path: PATH_ADMIN.enrollmentManagement,
          icon: <LibraryBooksIcon fontSize="small" />,
        },
      ],
    },
    {
      missions: translate("admin.sidebar.salesManagement"),
      listNav: [
        {
          title: translate("admin.sidebar.orderManagement"),
          path: PATH_ADMIN.orders,
          icon: <ShoppingCartIcon fontSize="small" />,
        },
      ],
    },
    {
      missions: translate("admin.sidebar.submissionManagement"),
      listNav: [
        {
          title: translate("admin.sidebar.submissionManagement"),
          path: PATH_ADMIN.submissions,
          icon: <AssignmentIcon fontSize="small" />,
        },
      ],
    },
  ];

  const navUser = [
    {
      missions: translate("admin.sidebar.account"),
      listNav: [
        {
          title: translate("admin.sidebar.profile"),
          path: PATH_USER.profile,
          icon: <PersonIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.myOrders"),
          path: PATH_USER.orders,
          icon: <ShoppingBagIcon fontSize="small" />,
        },
        {
          title: translate("admin.sidebar.security"),
          path: PATH_USER.security,
          icon: <SecurityIcon fontSize="small" />,
        },
      ],
    },
    // NOTE: "Học tập" section removed - myCourses moved to Student Profile tabs
  ];

  return { navAdmin, navUser };
}

export { useConfigSidebar };
