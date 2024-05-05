"use client";

//Now to make the next auth js work in our project we have to wrap our app inside SessionProvider provided by the next auth.
//We can use SessionProvider in layout.tsx and can wrap the HTML but the problem is that SessionProvider is a client-side component so we have to convert the whole layout.tsx into the client component or else we can create a component mark it as client side and we can use that component in the layout.tsx. Let’s do that...
//Create file name SessionWrapper.tsx inside the components folder.

import { SessionProvider } from "next-auth/react";

import React from "react";

const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default SessionWrapper