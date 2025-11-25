import './globals.css';
import { Inter } from 'next/font/google';

// 1. Import the components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ALANSARWEEKLY - Your Islamic Guide',
  description: 'An Islamic Q&A platform and weekly publication.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* We want the app to be laid out as a column (flex-col) 
            to ensure the footer is always at the bottom. */}
        <div className="flex flex-col min-h-screen">

          {/* 2. Place the Navbar at the top */}
          <Navbar />

          {/* 3. The main content area: This is where page.js and all other route components render. 
              We use flex-grow to make this section fill all available vertical space. */}
          <main className="flex-grow">
            {children}
          </main>

          {/* 4. Place the Footer at the bottom */}
          <Footer />
        </div>
      </body>
    </html>
  );
}