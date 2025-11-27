import { getRequestConfig } from 'next-intl/server';
import { getUserLanguage } from './getUserLanguage';

export default getRequestConfig(async () => {
  const locale = await getUserLanguage();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});