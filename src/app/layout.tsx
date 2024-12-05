import "./globals.css";

const RootLayout = ({ children } :any) => { //TODO remove any
  return (
    <html lang="en">
      <body>
        { children }
      </body>
    </html>
  )
};

export default RootLayout;