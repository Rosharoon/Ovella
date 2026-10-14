import React from 'react';
import { Circle, Ellipse, G, Path } from 'react-native-svg';

function Gloss({ cx, cy, rx = 9, ry = 6 }: { cx: number; cy: number; rx?: number; ry?: number }) {
  return <Ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" opacity={0.38} />;
}

function Leaf({ x, y, rotate = -28, fill = '#6E9A72' }: { x: number; y: number; rotate?: number; fill?: string }) {
  return <Ellipse cx={x} cy={y} rx={9} ry={4.2} fill={fill} transform={`rotate(${rotate} ${x} ${y})`} />;
}

function Stem({ d = 'M60 36 C62 26 70 22 76 26' }: { d?: string }) {
  return <Path d={d} stroke="#5E7D55" strokeWidth={2.4} fill="none" strokeLinecap="round" />;
}

function Wish() {
  return (
    <G>
      <Circle cx={60} cy={64} r={16} fill="#F6E8EC" />
      <Circle cx={60} cy={64} r={7} fill="#F2C1D4" />
      <Circle cx={60} cy={64} r={3} fill="#FFF6D8" />
      <Path d="M60 36 L62 48 L60 46 L58 48 Z M60 92 L58 80 L60 82 L62 80 Z M36 64 L48 62 L46 64 L48 66 Z M84 64 L72 66 L74 64 L72 62 Z" fill="#C78AAE" />
    </G>
  );
}

function Spark() {
  return (
    <G>
      <Circle cx={60} cy={64} r={10} fill="#F2C1D4" />
      <Circle cx={60} cy={64} r={4} fill="#FFF6D8" />
      <Path d="M60 34 L64 52 L60 48 L56 52 Z M60 94 L56 76 L60 80 L64 76 Z M34 64 L52 60 L48 64 L52 68 Z M86 64 L68 68 L72 64 L68 60 Z" fill="#C78AAE" />
    </G>
  );
}

function PoppySeed() {
  return (
    <G>
      <Ellipse cx={60} cy={66} rx={14} ry={18} fill="#3E4654" />
      <Ellipse cx={55} cy={60} rx={5} ry={7} fill="#6B7384" opacity={0.7} />
      <Gloss cx={54} cy={58} rx={4} ry={3} />
    </G>
  );
}

function Sesame() {
  return (
    <G>
      <Ellipse cx={60} cy={66} rx={12} ry={22} fill="#E6C27A" />
      <Ellipse cx={60} cy={66} rx={7} ry={16} fill="#F4DEAA" />
      <Path d="M60 46 C62 58 62 74 60 86" stroke="#C4A574" strokeWidth={1.2} fill="none" />
    </G>
  );
}

function AppleSeed() {
  return (
    <G>
      <Path d="M60 44 C72 50 74 70 60 88 C46 70 48 50 60 44 Z" fill="#6B4A32" />
      <Path d="M60 48 C64 58 64 74 60 84" stroke="#8A6244" strokeWidth={1.2} fill="none" />
      <Gloss cx={56} cy={56} rx={3} ry={4} />
    </G>
  );
}

function SweetPea() {
  return (
    <G>
      <Path d="M34 78 C40 58 52 52 60 62 C68 50 84 54 90 74 C78 70 66 74 60 84 C52 74 42 72 34 78 Z" fill="#9BC46A" />
      <Circle cx={52} cy={70} r={4} fill="#E7F2C4" />
      <Circle cx={66} cy={68} r={4} fill="#E7F2C4" />
      <Path d="M60 58 C62 44 74 40 80 48" stroke="#5E8A48" strokeWidth={2} fill="none" />
      <Leaf x={84} y={46} rotate={20} />
    </G>
  );
}

function PeaPod() {
  return (
    <G>
      <Path d="M28 70 C40 40 80 40 96 62 C84 86 44 90 28 70 Z" fill="#7EAA62" />
      <Path d="M34 68 C48 52 76 52 90 64" stroke="#5E8A48" strokeWidth={1.5} fill="none" />
      <Circle cx={48} cy={66} r={5} fill="#C6E39A" />
      <Circle cx={62} cy={62} r={5} fill="#C6E39A" />
      <Circle cx={76} cy={64} r={5} fill="#C6E39A" />
    </G>
  );
}

function Blueberry() {
  return (
    <G>
      <Circle cx={60} cy={68} r={26} fill="#3E5FBF" />
      <Circle cx={60} cy={68} r={26} fill="#2E4C9A" opacity={0.25} />
      <Path d="M46 50 C52 44 68 44 74 50 L70 56 C64 50 56 50 50 56 Z" fill="#6E9A72" />
      <Gloss cx={50} cy={60} />
    </G>
  );
}

function Raspberry() {
  return (
    <G>
      <Circle cx={60} cy={74} r={12} fill="#C4375A" />
      <Circle cx={48} cy={66} r={11} fill="#D44868" />
      <Circle cx={72} cy={66} r={11} fill="#D44868" />
      <Circle cx={54} cy={54} r={10} fill="#E25A78" />
      <Circle cx={68} cy={54} r={10} fill="#E25A78" />
      <Circle cx={60} cy={48} r={8} fill="#C4375A" />
      <Leaf x={74} y={40} rotate={-20} />
    </G>
  );
}

function Cherry() {
  return (
    <G>
      <Circle cx={46} cy={74} r={16} fill="#D23B45" />
      <Circle cx={74} cy={78} r={16} fill="#E04A52" />
      <Gloss cx={40} cy={68} rx={5} ry={4} />
      <Path d="M46 58 C48 40 60 32 66 28 M74 62 C70 42 64 32 66 28" stroke="#5E7D55" strokeWidth={2.2} fill="none" />
      <Leaf x={76} y={28} rotate={18} />
    </G>
  );
}

function Strawberry() {
  return (
    <G>
      <Path d="M60 100 C38 82 30 64 36 50 C42 38 52 40 60 48 C68 40 78 38 84 50 C90 64 82 82 60 100 Z" fill="#E23B3B" />
      <Gloss cx={50} cy={62} rx={6} ry={8} />
      {[
        [50, 58],
        [64, 56],
        [56, 70],
        [70, 68],
        [60, 82],
      ].map(([x, y]) => (
        <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx={1.6} ry={2.4} fill="#F7E2A8" />
      ))}
      <Path d="M46 48 C52 36 60 34 60 42 C60 34 70 36 76 48 C68 44 54 44 46 48 Z" fill="#5E8A48" />
    </G>
  );
}

function Fig() {
  return (
    <G>
      <Path d="M60 36 C80 44 88 64 80 86 C72 102 48 102 40 86 C32 64 40 44 60 36 Z" fill="#7A4E86" />
      <Path d="M52 40 C60 48 68 48 76 40" stroke="#5C3A68" strokeWidth={2} fill="none" />
      <Gloss cx={52} cy={58} rx={6} ry={8} />
      <Leaf x={78} y={38} rotate={-10} />
    </G>
  );
}

function Lime() {
  return (
    <G>
      <Ellipse cx={60} cy={68} rx={26} ry={24} fill="#8FBF4A" />
      <Ellipse cx={60} cy={68} rx={18} ry={16} fill="#B6D96A" />
      <Path d="M60 52 L60 84 M44 68 L76 68" stroke="#6E9A32" strokeWidth={1.4} />
      <Circle cx={60} cy={42} r={4} fill="#5E8A48" />
      <Gloss cx={50} cy={60} rx={6} ry={5} />
    </G>
  );
}

function Lemon() {
  return (
    <G>
      <Ellipse cx={60} cy={70} rx={28} ry={24} fill="#F2D15A" />
      <Ellipse cx={60} cy={44} rx={5} ry={6} fill="#E2C04A" />
      <Ellipse cx={60} cy={94} rx={4} ry={5} fill="#E2C04A" />
      <Gloss cx={48} cy={62} />
      <Leaf x={84} y={48} />
    </G>
  );
}

function Apple() {
  return (
    <G>
      <Path d="M60 40 C82 36 96 54 92 74 C88 96 74 104 60 102 C46 104 32 96 28 74 C24 54 38 36 60 40 Z" fill="#E04B4B" />
      <Path d="M60 42 C58 34 52 30 48 32 C54 28 62 32 60 42 Z" fill="#C9E2B8" />
      <Stem />
      <Leaf x={78} y={28} />
      <Gloss cx={46} cy={62} rx={8} ry={12} />
    </G>
  );
}

function Avocado() {
  return (
    <G>
      <Path d="M60 30 C82 40 90 60 82 82 C74 102 46 102 38 82 C30 60 38 40 60 30 Z" fill="#6B8F4E" />
      <Path d="M60 40 C74 48 78 64 72 80 C66 94 52 94 48 80 C42 64 46 48 60 40 Z" fill="#C6D98A" />
      <Circle cx={60} cy={70} r={12} fill="#8B5A34" />
      <Gloss cx={56} cy={66} rx={4} ry={3} />
    </G>
  );
}

function Pear() {
  return (
    <G>
      <Path d="M60 28 C74 34 80 48 76 62 C86 70 86 90 72 100 C56 108 40 98 38 82 C28 70 36 56 48 52 C46 40 50 30 60 28 Z" fill="#D7C36A" />
      <Stem d="M60 30 C62 20 72 16 78 20" />
      <Leaf x={82} y={22} rotate={-16} />
      <Gloss cx={52} cy={70} rx={7} ry={12} />
    </G>
  );
}

function SweetPotato() {
  return (
    <G>
      <Path d="M30 72 C36 50 58 46 78 54 C98 62 100 82 84 92 C64 104 36 96 30 72 Z" fill="#D47A45" />
      <Path d="M40 70 C56 62 74 64 88 74" stroke="#B86334" strokeWidth={1.5} fill="none" />
      <Gloss cx={48} cy={64} rx={7} ry={5} />
    </G>
  );
}

function Mango() {
  return (
    <G>
      <Path d="M34 68 C36 46 58 34 78 42 C98 50 100 74 86 90 C70 104 40 100 32 84 C28 74 30 74 34 68 Z" fill="#F0B429" />
      <Path d="M48 70 C62 60 78 62 90 74" stroke="#E07A3A" strokeWidth={8} opacity={0.35} fill="none" strokeLinecap="round" />
      <Stem d="M74 42 C70 30 80 24 86 28" />
      <Gloss cx={52} cy={62} />
    </G>
  );
}

function Banana() {
  return (
    <G>
      <Path d="M34 78 C30 58 46 40 70 36 C86 34 98 46 92 58 C78 52 62 58 54 74 C64 70 78 74 84 86 C70 96 46 94 34 78 Z" fill="#F6DE6A" />
      <Path d="M40 74 C52 62 72 58 88 62" stroke="#E2C24A" strokeWidth={2} fill="none" />
      <Path d="M86 40 L92 32" stroke="#6B8F4E" strokeWidth={3} strokeLinecap="round" />
    </G>
  );
}

function Carrot() {
  return (
    <G>
      <Path d="M60 42 L78 96 C70 104 50 104 42 96 Z" fill="#F08A2A" />
      <Path d="M52 58 L70 64 M50 72 L72 78 M54 86 L70 90" stroke="#E07018" strokeWidth={1.4} />
      <Path d="M48 42 C44 28 52 24 58 36 M60 38 C62 22 74 24 70 40 M70 42 C82 30 88 38 74 48" stroke="#5E8A48" strokeWidth={3} fill="none" strokeLinecap="round" />
    </G>
  );
}

function Papaya() {
  return (
    <G>
      <Ellipse cx={60} cy={68} rx={26} ry={32} fill="#F0A04A" />
      <Path d="M60 40 C64 56 64 80 60 96" stroke="#E08A32" strokeWidth={1.4} fill="none" />
      <Circle cx={54} cy={64} r={2} fill="#3E4654" />
      <Circle cx={66} cy={70} r={2} fill="#3E4654" />
      <Circle cx={58} cy={78} r={2} fill="#3E4654" />
      <Leaf x={80} y={40} />
      <Gloss cx={48} cy={56} />
    </G>
  );
}

function Grapefruit() {
  return (
    <G>
      <Circle cx={60} cy={66} r={30} fill="#F3B4A2" />
      <Circle cx={60} cy={66} r={22} fill="#F7D2C4" />
      <Path d="M60 44 L60 88 M38 66 L82 66 M44 50 L76 82 M76 50 L44 82" stroke="#E08A78" strokeWidth={1.5} />
      <Circle cx={60} cy={34} r={4} fill="#6E9A72" />
      <Gloss cx={48} cy={54} rx={6} ry={5} />
    </G>
  );
}

function Corn() {
  return (
    <G>
      <Path d="M40 36 C28 60 30 90 48 100 L60 40 Z" fill="#8FBF62" />
      <Path d="M80 36 C92 60 90 90 72 100 L60 40 Z" fill="#7EAA52" />
      <Path d="M48 40 C52 30 68 30 72 42 L68 98 C60 104 52 98 48 40 Z" fill="#F2D15A" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <Circle key={`${row}-${col}`} cx={54 + col * 6} cy={52 + row * 12} r={2.2} fill="#E2B83A" />
        )),
      )}
    </G>
  );
}

function Cauliflower() {
  return (
    <G>
      <Path d="M30 78 C28 96 92 96 90 78 C80 86 40 86 30 78 Z" fill="#6E9A72" />
      <Circle cx={46} cy={62} r={14} fill="#F4F0E6" />
      <Circle cx={64} cy={58} r={16} fill="#FFFCF6" />
      <Circle cx={78} cy={68} r={12} fill="#F4F0E6" />
      <Circle cx={58} cy={74} r={12} fill="#FFFCF6" />
    </G>
  );
}

function Scallion() {
  return (
    <G>
      <Path d="M40 96 C42 70 46 50 44 36" stroke="#F4F0E6" strokeWidth={6} strokeLinecap="round" />
      <Path d="M56 100 C58 72 60 48 58 32" stroke="#F7F3EA" strokeWidth={6} strokeLinecap="round" />
      <Path d="M72 96 C74 70 70 50 74 34" stroke="#EFE8DC" strokeWidth={6} strokeLinecap="round" />
      <Path d="M40 48 C30 30 36 18 48 28" stroke="#5E8A48" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M58 44 C62 20 78 18 74 36" stroke="#6E9A72" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Path d="M74 46 C88 30 96 40 84 52" stroke="#7EAA62" strokeWidth={4} fill="none" strokeLinecap="round" />
    </G>
  );
}

function Lettuce() {
  return (
    <G>
      <Ellipse cx={60} cy={74} rx={32} ry={22} fill="#8FBF62" />
      <Path d="M32 70 C40 48 52 46 60 62 C68 44 84 48 90 70 C78 60 68 64 60 74 C52 64 42 60 32 70 Z" fill="#B6D96A" />
      <Path d="M40 62 C48 50 56 58 60 68 C66 52 76 50 82 64" stroke="#6E9A48" strokeWidth={1.4} fill="none" />
    </G>
  );
}

function Eggplant() {
  return (
    <G>
      <Path d="M60 40 C84 48 90 70 80 90 C70 106 46 104 40 86 C32 66 40 46 60 40 Z" fill="#5C3D78" />
      <Gloss cx={50} cy={62} rx={6} ry={14} />
      <Path d="M48 42 C56 34 70 34 76 44 C66 40 54 40 48 42 Z" fill="#6E9A72" />
      <Stem d="M64 38 C66 28 74 26 76 30" />
    </G>
  );
}

function Squash() {
  return (
    <G>
      <Path d="M36 78 C34 96 70 104 78 88 C90 64 96 48 84 42 C74 36 66 48 62 60 C58 46 46 40 40 52 C34 62 34 68 36 78 Z" fill="#E7B15A" />
      <Circle cx={84} cy={40} r={4} fill="#6E9A72" />
      <Gloss cx={48} cy={66} rx={6} ry={8} />
    </G>
  );
}

function Cabbage() {
  return (
    <G>
      <Ellipse cx={60} cy={70} rx={32} ry={26} fill="#7EAA62" />
      <Ellipse cx={60} cy={70} rx={22} ry={18} fill="#B6D98A" />
      <Ellipse cx={60} cy={70} rx={12} ry={10} fill="#E4F2C8" />
      <Path d="M30 66 C40 50 50 58 60 70 C70 56 82 50 92 68" stroke="#5E8A48" strokeWidth={1.5} fill="none" />
    </G>
  );
}

function Coconut() {
  return (
    <G>
      <Circle cx={60} cy={68} r={30} fill="#8B5A34" />
      <Circle cx={60} cy={68} r={22} fill="#C48A5A" />
      <Ellipse cx={52} cy={64} rx={3} ry={4} fill="#5A3824" />
      <Ellipse cx={64} cy={62} rx={3} ry={4} fill="#5A3824" />
      <Ellipse cx={60} cy={74} rx={3} ry={4} fill="#5A3824" />
      <Gloss cx={48} cy={54} rx={6} ry={4} />
    </G>
  );
}

function Jicama() {
  return (
    <G>
      <Ellipse cx={60} cy={70} rx={30} ry={24} fill="#F3E6C8" />
      <Path d="M36 66 C48 58 74 58 86 68 M34 76 C50 84 74 84 88 74" stroke="#E2D0A4" strokeWidth={1.5} fill="none" />
      <Path d="M60 46 C64 38 70 40 68 48" stroke="#6E9A72" strokeWidth={2} fill="none" />
      <Gloss cx={48} cy={62} />
    </G>
  );
}

function Pineapple() {
  return (
    <G>
      <Path d="M48 36 L44 20 M60 32 L60 16 M72 36 L78 20 M54 34 L50 22 M66 34 L72 22" stroke="#5E8A48" strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={60} cy={74} rx={24} ry={30} fill="#E2B43A" />
      <Path d="M42 60 L78 70 M40 74 L80 80 M44 86 L76 90 M48 52 L76 58" stroke="#C4922A" strokeWidth={1.3} />
      <Path d="M52 48 L68 96 M68 50 L50 98" stroke="#C4922A" strokeWidth={1.3} />
    </G>
  );
}

function Cantaloupe() {
  return (
    <G>
      <Circle cx={60} cy={68} r={30} fill="#F0B15A" />
      <Path d="M36 56 C48 50 70 52 86 60 M34 70 C50 64 74 66 88 74 M38 82 C52 78 72 80 84 86" stroke="#E09A40" strokeWidth={1.2} fill="none" />
      <Path d="M48 44 C60 40 74 48 70 56" stroke="#D8C2A0" strokeWidth={1.2} fill="none" />
      <Gloss cx={48} cy={58} />
    </G>
  );
}

function Honeydew() {
  return (
    <G>
      <Circle cx={60} cy={68} r={30} fill="#D5E6A8" />
      <Circle cx={60} cy={68} r={22} fill="#E7F2C4" />
      <Path d="M60 46 L60 90 M40 68 L80 68" stroke="#B6D07A" strokeWidth={1.3} />
      <Gloss cx={48} cy={58} />
    </G>
  );
}

function Romaine() {
  return (
    <G>
      <Path d="M60 100 C48 80 44 60 52 36 C56 28 64 28 68 36 C76 60 72 80 60 100 Z" fill="#8FBF62" />
      <Path d="M60 96 C56 70 56 50 60 38" stroke="#6E9A48" strokeWidth={1.6} fill="none" />
      <Path d="M46 90 C42 68 46 50 54 40" fill="#B6D96A" />
      <Path d="M74 90 C78 68 74 50 66 40" fill="#7EAA52" />
    </G>
  );
}

function Chard() {
  return (
    <G>
      <Path d="M40 96 C30 70 36 40 60 30 C84 40 90 70 80 96 C70 84 50 84 40 96 Z" fill="#6E9A62" />
      <Path d="M60 34 L58 92" stroke="#F2E27A" strokeWidth={3} />
      <Path d="M60 50 L42 62 M60 62 L80 70 M60 74 L44 84" stroke="#F2E27A" strokeWidth={1.6} />
    </G>
  );
}

function Leek() {
  return (
    <G>
      <Path d="M48 100 L44 58 C58 48 70 48 78 60 L72 100 Z" fill="#F4F0E4" />
      <Path d="M50 70 C58 62 70 64 74 74" stroke="#E4DCC8" strokeWidth={2} fill="none" />
      <Path d="M46 58 C36 36 48 22 58 40" stroke="#5E8A48" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Path d="M70 56 C84 34 96 42 82 58" stroke="#6E9A72" strokeWidth={5} fill="none" strokeLinecap="round" />
    </G>
  );
}

function Watermelon() {
  return (
    <G>
      <Path d="M26 70 C40 100 80 100 94 70 Z" fill="#3E8F4A" />
      <Path d="M32 70 C44 92 76 92 88 70 Z" fill="#F4F0E6" />
      <Path d="M36 70 C46 86 74 86 84 70 Z" fill="#E85A62" />
      <Circle cx={52} cy={78} r={1.8} fill="#3E4654" />
      <Circle cx={64} cy={80} r={1.8} fill="#3E4654" />
      <Circle cx={74} cy={76} r={1.8} fill="#3E4654" />
      <Path d="M30 66 C48 60 74 60 90 68" stroke="#2F6E38" strokeWidth={2} fill="none" />
    </G>
  );
}

function Pumpkin() {
  return (
    <G>
      <Ellipse cx={40} cy={72} rx={16} ry={24} fill="#E07A28" />
      <Ellipse cx={60} cy={70} rx={18} ry={28} fill="#F08A32" />
      <Ellipse cx={80} cy={72} rx={16} ry={24} fill="#E07A28" />
      <Path d="M60 44 L60 96" stroke="#C46218" strokeWidth={1.6} />
      <Stem d="M60 46 C62 34 74 30 78 36" />
      <Leaf x={82} y={34} rotate={12} />
      <Gloss cx={52} cy={62} rx={5} ry={10} />
    </G>
  );
}

const FRUIT: Record<number, () => React.ReactNode> = {
  1: Wish,
  2: Spark,
  3: PoppySeed,
  4: Sesame,
  5: AppleSeed,
  6: SweetPea,
  7: Blueberry,
  8: Raspberry,
  9: Cherry,
  10: Strawberry,
  11: Fig,
  12: Lime,
  13: PeaPod,
  14: Lemon,
  15: Apple,
  16: Avocado,
  17: Pear,
  18: SweetPotato,
  19: Mango,
  20: Banana,
  21: Carrot,
  22: Papaya,
  23: Grapefruit,
  24: Corn,
  25: Cauliflower,
  26: Scallion,
  27: Lettuce,
  28: Eggplant,
  29: Squash,
  30: Cabbage,
  31: Coconut,
  32: Jicama,
  33: Pineapple,
  34: Cantaloupe,
  35: Honeydew,
  36: Romaine,
  37: Chard,
  38: Leek,
  39: Watermelon,
  40: Pumpkin,
};

export function FruitGlyph({ week }: { week: number }) {
  const Draw = FRUIT[Math.min(40, Math.max(1, week))] ?? Apple;
  return <Draw />;
}
