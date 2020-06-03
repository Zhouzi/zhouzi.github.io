import * as React from "react";
import { fr } from "../messages";
import { Layout } from "../design";

export default function FrenchLayout({ children }) {
  return (
    <Layout locale="fr" messages={fr}>
      {children}
    </Layout>
  );
}
