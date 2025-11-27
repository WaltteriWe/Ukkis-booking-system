import { cookies } from "next/headers";

export async function getUserLanguage() {
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get("NEXT_LOCALE");

    return localeCookie?.value || "en";
}