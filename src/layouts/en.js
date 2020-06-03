import * as React from "react";
import { en } from "../messages";
import { Layout } from "../design";

export default function EnglishLayout({ children }) {
  return (
    <Layout locale="en" messages={en}>
      {children}
    </Layout>
  );
}
