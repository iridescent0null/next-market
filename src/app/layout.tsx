import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const RootLayout = ({ children }: {children: React.ReactNode}) => {
  return (
    <html lang="en">
      <head>
        <title>Iridescent's Next Sandbox Application</title>
      </head>
      <body>
        <Header/>
        { children }
        <Footer/>
      </body>
    </html>
  )
};

export default RootLayout;