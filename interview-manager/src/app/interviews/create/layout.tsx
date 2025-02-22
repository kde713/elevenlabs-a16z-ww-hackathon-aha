import type {Metadata} from "next";
import "@/app/globals.css";
import {ProviderContainer} from "@/components/provider-container";

export const metadata: Metadata = {
    title: "aha! | Create Interview Session",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={"h-full w-full"}>
        <body className={`antialiased w-full h-full lex flex-col`}>
        <ProviderContainer>
            <div className="flex flex-col flex-grow w-full items-center justify-center sm:px-4">
                {children}
            </div>
        </ProviderContainer>
        </body>
        </html>
    );
}
