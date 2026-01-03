import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quản lý nhân sự",
  description: "Hệ thống quản lý nhân sự",
};

import { Providers } from "./components/Providers";

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased text-[12px] font-Arial">
        <AntdRegistry>
          <ConfigProvider locale={viVN}>
            <Providers>{children}</Providers>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
