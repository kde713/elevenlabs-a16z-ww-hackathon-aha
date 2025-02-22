'use client';

import type {PropsWithChildren} from "react";
import {HeroUIProvider} from "@heroui/react";

export const ProviderContainer = (props: PropsWithChildren) => {
    return (
        <HeroUIProvider>
            {props.children}
        </HeroUIProvider>
    )
}