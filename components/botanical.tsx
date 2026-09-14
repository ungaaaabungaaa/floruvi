// Original vector illustrations. These are category artwork, not product photographs.
export function Botanical({
  category = "leafy-greens",
  seed = 0,
  hero = false,
}: {
  category?: string;
  seed?: number;
  hero?: boolean;
}) {
  const leaf = ["#36583a", "#577844", "#80934f", "#9da85c", "#284b35"];
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      className={hero ? "botanical botanical-hero" : "botanical"}
    >
      <ellipse
        cx="204"
        cy="342"
        rx="108"
        ry="13"
        fill="#203d29"
        opacity=".08"
      />
      {category === "fruiting-crops" ? (
        <>
          <path d="M200 180 Q240 80 307 86" stroke="#38583a" strokeWidth="9" />
          {[
            { x: 154, y: 215, r: 80 },
            { x: 253, y: 246, r: 69 },
            { x: 239, y: 149, r: 47 },
          ].map(({ x, y, r }, i) => (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={["#be573b", "#d57b48", "#a44330"][i]}
              />
              <path
                d={`M${x - r / 3} ${y - r / 2} Q${x - r / 2} ${y - r / 4} ${x - r / 2} ${y}`}
                stroke="#efb28a"
                strokeWidth="5"
                strokeLinecap="round"
                opacity=".5"
              />
              <path
                d={`M${x} ${y - r + 4} l-26 -7 15 20 -12 15 28 -12 25 16 -9 -24 15 -14 -26 6z`}
                fill="#3d5c35"
              />
            </g>
          ))}
        </>
      ) : category === "edible-flowers" ? (
        <>
          {[
            [-65, 5],
            [42, -47],
            [55, 79],
            [-41, 113],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${200 + x} ${150 + y})`}>
              <path
                d={`M0 0 Q${-x} 100 ${-x} ${190 - y}`}
                stroke="#597947"
                strokeWidth="5"
              />
              {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                  key={angle}
                  cx="0"
                  cy="-23"
                  rx="24"
                  ry="35"
                  transform={`rotate(${angle})`}
                  fill={["#b17b9e", "#d6a44a", "#cc958d", "#9684b0"][i]}
                />
              ))}
              <circle r="14" fill="#eacb80" />
            </g>
          ))}
        </>
      ) : category === "roots-and-stems" ? (
        <>
          {[-1, 0, 1].map((n, i) => (
            <g
              key={n}
              transform={`translate(${200 + n * 57} ${220 + Math.abs(n) * 10}) rotate(${n * 20})`}
            >
              <path
                d="M-29 0 Q-35 47 0 122 Q36 37 29 0Z"
                fill={["#c77246", "#df9851", "#c8854c"][i]}
              />
              <path
                d="M-17 22 h20 M-7 45 h22 M-9 72 h16"
                stroke="#9b5b38"
                strokeWidth="3"
              />
              {[-30, 0, 30].map((a) => (
                <path
                  key={a}
                  d="M0 5 C-52 -38 -31 -112 0 -142 C34 -89 41 -28 0 5"
                  fill={leaf[(i + 3) % 5]}
                  transform={`rotate(${a})`}
                />
              ))}
            </g>
          ))}
        </>
      ) : category === "microgreens" ? (
        <>
          {Array.from({ length: 13 }, (_, i) => {
            const x = 79 + i * 20;
            const y = 150 + ((i * 37) % 95);
            return (
              <g key={i}>
                <path
                  d={`M${x} 327 Q${x + 15} 230 ${x} ${y}`}
                  stroke={i % 3 ? "#779056" : "#af7780"}
                  strokeWidth="4"
                />
                <ellipse
                  cx={x - 14}
                  cy={y - 7}
                  rx="23"
                  ry="12"
                  fill={leaf[i % 5]}
                  transform={`rotate(35 ${x - 14} ${y - 7})`}
                />
                <ellipse
                  cx={x + 14}
                  cy={y - 10}
                  rx="23"
                  ry="12"
                  fill={leaf[(i + 2) % 5]}
                  transform={`rotate(-35 ${x + 14} ${y - 10})`}
                />
              </g>
            );
          })}
        </>
      ) : (
        <>
          {(category === "herbs"
            ? [-65, -38, -12, 15, 40, 66]
            : [-75, -50, -25, 0, 25, 50, 75]
          ).map((angle, i) => (
            <g key={angle} transform={`rotate(${angle} 200 320)`}>
              <path
                d={
                  category === "herbs"
                    ? "M200 321 Q188 197 206 83"
                    : "M200 331 Q191 188 201 61"
                }
                stroke="#486340"
                strokeWidth="5"
              />
              {category === "herbs" ? (
                [0, 1, 2].map((j) => (
                  <g key={j} transform={`translate(0 ${j * 65})`}>
                    <path
                      d="M199 156 C133 147 123 105 129 87 C179 84 203 111 199 156"
                      fill={leaf[(i + j + seed) % 5]}
                    />
                    <path
                      d="M200 175 C263 163 277 127 268 104 C222 105 197 139 200 175"
                      fill={leaf[(i + j + 1 + seed) % 5]}
                    />
                  </g>
                ))
              ) : (
                <>
                  <path
                    d="M200 316 C157 291 164 278 144 260 C116 235 143 219 124 194 C109 176 135 161 130 138 C124 115 150 112 150 88 C152 58 183 61 199 39 C216 60 245 50 252 83 C252 105 280 113 269 139 C288 164 265 177 275 199 C278 225 251 230 253 255 C247 286 221 285 200 316Z"
                    fill={leaf[(i + seed) % 5]}
                  />
                  <path
                    d="M200 304 L200 77 M200 239 L151 200 M200 197 L247 151 M200 154 L164 119"
                    stroke="#e4e1a5"
                    strokeWidth="2"
                    opacity=".38"
                  />
                </>
              )}
            </g>
          ))}
          <path d="M184 319 l36 3 -5 14 -31 -3z" fill="#d2b988" />
        </>
      )}
    </svg>
  );
}
