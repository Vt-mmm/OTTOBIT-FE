import { ReactNode } from "react";

export interface NavSection {
  missions: string;
  listNav: Array<NavItem>;
}

export interface NavItem {
  title: string;
  path: string;
  icon: ReactNode;
}
