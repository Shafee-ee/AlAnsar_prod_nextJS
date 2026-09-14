"use client";

export default function BookLoader() {
  return (
    <div className="book-loader" aria-label="Loading">
      <div className="book">
        {/* Pages already on the left */}
        <div className="page-stack left-stack" />

        {/* Pages underneath on the right */}
        <div className="page-stack right-stack" />

        {/* The page currently being flipped */}
        <div className="flipping-page">
          <div className="page-front" />
          <div className="page-back" />
        </div>

        <div className="book-spine" />
      </div>

      <style jsx>{`
        .book-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .book {
          position: relative;
          width: 70px;
          height: 48px;
          perspective: 700px;
          transform: scale(0.6);
        }

        .page-stack {
          position: absolute;
          top: 3px;
          width: 32px;
          height: 42px;
          background: white;
          border: 1px solid #dbeafe;
        }

        .left-stack {
          left: 2px;
          border-radius: 4px 0 0 4px;
        }

        .right-stack {
          right: 2px;
          border-radius: 0 4px 4px 0;
          border-right: 4px solid #bfdbfe;
          border-bottom: 2px solid #bfdbfe;
        }

        .flipping-page {
          position: absolute;
          top: 3px;
          left: 50%;
          width: 32px;
          height: 42px;

          transform-origin: left center;
          transform-style: preserve-3d;

          z-index: 4;

          animation: flipPage 1.4s linear infinite;
        }

        .page-front,
        .page-back {
          position: absolute;
          inset: 0;

          background: white;
          border: 1px solid #93c5fd;

          backface-visibility: hidden;
          box-sizing: border-box;
        }

        .page-front::after,
        .page-back::after {
          content: "";
          position: absolute;
          inset: 3px;

          border: 1px solid #dbeafe;
          border-radius: 1px;
        }

        .page-front {
          border-radius: 0 4px 4px 0;
        }

        .page-back {
          border-radius: 4px 0 0 4px;
          transform: rotateY(180deg);
          background: #eff6ff;
        }

        .book-spine {
          position: absolute;
          top: 2px;
          left: 50%;
          width: 3px;
          height: 44px;

          transform: translateX(-50%);

          background: #2563eb;
          border-radius: 2px;

          z-index: 6;
        }

        @keyframes flipPage {
          /* Page sitting normally on the right */
          0% {
            transform: rotateY(0deg);
            z-index: 4;
          }

          /* Starts bending */
          20% {
            transform: rotateY(-45deg);
            z-index: 4;
          }

          /* Edge-on at the spine */
          40% {
            transform: rotateY(-90deg);
            z-index: 4;
          }

          /* Now travelling across to the left */
          60% {
            transform: rotateY(-135deg);
            z-index: 4;
          }

          /* Fully turned over */
          72% {
            transform: rotateY(-180deg);
            z-index: 4;
          }

          /* Hide underneath the left stack */
          73% {
            transform: rotateY(-180deg);
            z-index: 0;
          }

          /*
           * Reset while hidden underneath the book.
           * The next page starts on the right.
           */
          100% {
            transform: rotateY(0deg);
            z-index: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .flipping-page {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
