/**
 * Seed Script — Populate MongoDB with sample products
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Sample products matching the existing frontend
const products = [
  {
    name: 'The Sculpted Trench',
    price: 1450,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuA8BKH1_0Qozt72G0zjJUeMlWLwQEzT2PSyREPAaz-ML66uy0quZKYBaWmVoSHtQj58ffREJ-FUhMUtcqQRS6EuJseV9gnPPOtu5p7uAllUjOAAVwZOxyiVPSfU3s51ualvCO2btSp2UPK5Mna95QHbTg1_7oFpwHBtj3Yoj16CitOsduVPetURMt7foavEkansXGeh7wh8zZHQQB8mrnJFa3ZpuNlR1cGjB-9fMVfFBiQkzHOQGyZegmTrcJxBKpjOLSatjm2tdZYA'],
    category: 'Outerwear',
    sizes: ['FR 34', 'FR 36', 'FR 38', 'FR 40', 'FR 42'],
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Stone', hex: '#9B8E7E' }
    ],
    stock: 25,
    description: 'A structured trench coat with architectural precision. Crafted from premium technical fabric with minimal hardware.',
    tags: ['trench', 'coat', 'outerwear', 'minimalist', 'architectural'],
    isNewArrival: true,
    isFeatured: false,
    specifications: {
      fabric: '100% Technical Cotton',
      lining: 'Silk Blend',
      closure: 'Hidden Snap Buttons',
      madeIn: 'Italy'
    },
    care: ['Professional dry clean only', 'Cool iron on reverse', 'Store on padded hanger']
  },
  {
    name: 'Lumina Silk Gown',
    price: 890,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBMopIRaoOWe1aMMVL2t-yVr-qOgv4UrNFumBGuv23ujvoBonmhlI8GzNaFVWcrS2l2C9Afpg0MY8PGbTAZcEDV3JNAcveDvPJZ4wEi3mPRumOlDJRrKouAHMx1YUzGGdAp_xKnDu1O-aSV5QMAmePCThHvGtQSNr2A_2t6H411DOKTZWl8CP1nRqF4PDmeB9J44O7jWGDroO-uUZsjjaSZbWa3Kimm1SFlo6sUej12OmLhrwhhohVI2VFcOm6LV6jhNrSD-yV53UI'],
    category: 'Dresses',
    sizes: ['FR 34', 'FR 36', 'FR 38', 'FR 40'],
    colors: [
      { name: 'Ivory', hex: '#FFFFF0' },
      { name: 'Champagne', hex: '#F7E7CE' }
    ],
    stock: 18,
    description: 'An ethereal silk gown with flowing silhouette. Perfect for evening occasions and special events.',
    tags: ['gown', 'dress', 'silk', 'evening', 'formal'],
    isNewArrival: false,
    isFeatured: true,
    specifications: {
      fabric: '100% Mulberry Silk',
      lining: 'Crêpe de Chine',
      closure: 'Concealed Side Zip',
      madeIn: 'France'
    },
    care: ['Professional dry clean only', 'Avoid contact with perfumes', 'Store in breathable garment bag']
  },
  {
    name: 'Anthracite Blazer',
    price: 2100,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuD_-ulQOmC5pz_7sPB9r0C2W7IzxdAbBfwPNvquoMMmWy0aa4plG8usAvi6N82HM67dEW5N6cPg2P47v-6L4DWeifQGDm1nntxvOGuETfHCbLy1tjwM_rei45klqMKQ-c_Uh9C8MvIRZjxAxlOl7r2-ew0HqHSUL6fju9ffIDnTC_YH7nmJidpgX5hw_dJtcLcHfHR8QkDoOzvDQvGJTUrCVBrNgfxd9n5ucZw43ETIvJlNKlO11dyODKdloBOSWLsmivQY5sJvxBSh'],
    category: 'Tailoring',
    sizes: ['FR 36', 'FR 38', 'FR 40', 'FR 42', 'FR 44'],
    colors: [
      { name: 'Anthracite', hex: '#3B3B3B' },
      { name: 'Charcoal', hex: '#36454F' }
    ],
    stock: 12,
    description: 'A double-breasted blazer with sharp, architectural lines. Limited edition piece from the Autumn collection.',
    tags: ['blazer', 'tailoring', 'double-breasted', 'limited', 'architectural'],
    isNewArrival: false,
    isFeatured: false,
    isLimited: true,
    specifications: {
      fabric: 'Premium Wool Blend',
      lining: 'Silk',
      closure: 'Double-Breasted Buttons',
      madeIn: 'Italy'
    },
    care: ['Professional dry clean only', 'Steam to refresh', 'Store on shaped hanger']
  },
  {
    name: 'Cloud Cashmere Rollneck',
    price: 550,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBTirCW_xn_W2q05bkkVaAye2DCmPt2L66PTuUGdDKstnzzs87hME3is2_i4zFZvqm8fTj296fv91tl11EeFQetthueIISXU9jm2z3_fsh_g_4V77Dju3jwRTglgE2MgqxsEb7ODVOOMs1AihMga2kbP_I7JBSlXijrJytiSnQ5UMH2wMZeLRpb6YfY8hkajPI8dJoGMq4iaKl8fs3KyJr6wB-WJ4ZKp8QXULMVngO2ZymsuTyxJb-loHrnk4jUfabf9g0kkeEldcJD'],
    category: 'Knitwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Cloud', hex: '#F5F5F5' },
      { name: 'Oatmeal', hex: '#D3C5BE' },
      { name: 'Slate', hex: '#708090' }
    ],
    stock: 35,
    description: 'An ultra-soft cashmere rollneck sweater. Essential piece for the modern wardrobe.',
    tags: ['sweater', 'cashmere', 'knitwear', 'rollneck', 'essential'],
    isNewArrival: false,
    isFeatured: true,
    specifications: {
      fabric: '100% Grade-A Cashmere',
      lining: 'Unlined',
      closure: 'Pull-over',
      madeIn: 'Mongolia'
    },
    care: ['Hand wash cold', 'Lay flat to dry', 'Use cashmere comb']
  },
  {
    name: 'Monumental Trouser',
    price: 720,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAAcYFnR8Xx-gm7IxFt3pbjTA_eR4S8YIjtNlspbmVkGia8baElD6eeCNy_rc-xUbbzXks2xMr4xddyrEViShp9M44OOh1tL27L-HXYucTlv-pIQRFmH6mAuXB06f-c7HXKUyR1o3e_NhjK0l5kpgAy_y2KtrnX6a3bqAHnOKNTPwscM8-ZDSqzNtReOOJE-XKG2aEz9hT_uvVkI6vFmbnapCl2-zCjagasKVl1xMjKxpAMCv9IZbC1HECZFZ1eRPVoXjWESeuiduAU'],
    category: 'Tailoring',
    sizes: ['FR 34', 'FR 36', 'FR 38', 'FR 40', 'FR 42'],
    colors: [
      { name: 'Cream', hex: '#FFFDD0' },
      { name: 'Black', hex: '#000000' }
    ],
    stock: 28,
    description: 'High-waisted wide-leg trousers with clean, architectural lines. A cornerstone of refined dressing.',
    tags: ['trousers', 'pants', 'tailoring', 'wide-leg', 'high-waisted'],
    isNewArrival: false,
    isFeatured: false,
    specifications: {
      fabric: 'Premium Wool',
      lining: 'Partial Silk',
      closure: 'Side Zip with Hook',
      madeIn: 'Italy'
    },
    care: ['Professional dry clean only', 'Cool iron on reverse', 'Hang to store']
  },
  {
    name: 'Heritage Carryall',
    price: 2800,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAD6dZyDOm8wpW7Vce-n5E6Oq9RDYRcRDpubzczvtxGp31vJHODFjTiPv4M5uKMOmwgv45wPnKfpnyi1ayF2RGV9Ii2_iRlWlNdfJuupBtzra1JPQt2ccWIUV6m-666n31akUexCGzD6DMx2x4fHAbwHYlj_-tetu2W_UPhtgAViDuhr37To946SbT-DvJYnXgfHjQbY_9bdsfXL27qpVlvHtWXkmOs88H6ieejoPi0QDwopzm-xsGNcMiC90DXrm11UT-Ry2ATmLWg'],
    category: 'Accessories',
    sizes: ['One Size'],
    colors: [
      { name: 'Burgundy', hex: '#800020' },
      { name: 'Noir', hex: '#000000' },
      { name: 'Cognac', hex: '#834333' }
    ],
    stock: 15,
    description: 'A luxurious leather carryall with geometric silver hardware. Crafted for the discerning traveler.',
    tags: ['bag', 'carryall', 'leather', 'accessories', 'luxury'],
    isNewArrival: false,
    isFeatured: true,
    specifications: {
      fabric: 'Full-Grain Italian Leather',
      lining: 'Suede',
      closure: 'Magnetic Snap',
      madeIn: 'Italy'
    },
    care: ['Condition with leather balm', 'Store stuffed with tissue', 'Avoid prolonged sunlight']
  },
  {
    name: 'Oversized Merino Sweater',
    price: 245,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDkdU5A9J9uGNxSABtANhWKGDsHaZQZC1aj3MPmC-112YBMt-dmZi18P4AiyQzpHK8f4IfMH8dUKXIXplEPWlYReHQ-hoPU0xaYqkNTuLKf52UhTDuC9XNbPtfIwzgguvslJHzeswVvQYH_BpUnFgljCXMJ3J28taBvk_perWo1Fb_MU00PRg7watU6RBKSX7DHF2mDod08QRY_mLLrvNPBhwsm90SpJdtV6qgLjZELCKjW3_GCHEpKKDLiH2ctGqU-PM6W43WsW7JK'],
    category: 'Knitwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Ivory', hex: '#FFFFF0' }
    ],
    stock: 42,
    description: 'An oversized long-sleeve merino sweater. Relaxed fit with premium texture.',
    tags: ['sweater', 'merino', 'knitwear', 'oversized', 'casual'],
    isNewArrival: true,
    isFeatured: false,
    specifications: {
      fabric: '100% Merino Wool',
      lining: 'Unlined',
      closure: 'Pull-over',
      madeIn: 'New Zealand'
    },
    care: ['Machine wash cold', 'Lay flat to dry', 'Low heat iron if needed']
  },
  {
    name: 'Sculptural Wool Trouser',
    price: 380,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAt3tndtdT7xlBNCWWSfcu19XbL0NNyBsz-MaiA-tO9tsy3xlZOCbREb4_1mBmOURUcFKeib_kfXCoyFSYZNUX1OSjwngwAC02pHNZ_HfBWdCVDsKOfdK03smVsL22BPzTE5lN8JEXZLrym5uXpPZQaCUQaCXVrte2yBMkezU34HjNZxXfgiFe0hhJaDQ6YsErYaXKMeqTL8ZPiyVfnux9a7hmXos7yhOv9jswyBHDvNEDdO5rXEA2N7meWN2QYw22VgPUPjoHUzb6M'],
    category: 'Tailoring',
    sizes: ['FR 34', 'FR 36', 'FR 38', 'FR 40', 'FR 42'],
    colors: [
      { name: 'Camel', hex: '#C19A6B' },
      { name: 'Black', hex: '#000000' }
    ],
    stock: 30,
    description: 'High-waisted tailored wool trousers in camel. Clean lines and premium drape.',
    tags: ['trousers', 'pants', 'wool', 'tailoring', 'high-waisted'],
    isNewArrival: true,
    isFeatured: false,
    specifications: {
      fabric: 'Premium Wool',
      lining: 'Partial Silk',
      closure: 'Side Zip with Hook',
      madeIn: 'Italy'
    },
    care: ['Professional dry clean only', 'Cool iron on reverse', 'Hang to store']
  },
  {
    name: "The Architect's Shirt",
    price: 190,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuA8ifNhwNQomtVemyj76QYYip4YZ_FLj6DDv32Pi5SrP4iASmpx-542qskryZnWNl1xhA0BzTF83W4L3Jl9bJfZ6zuymFgtMYuBKEMoxo_3hm19RyJ6RCBZ0vGYsxsta1Wh3Qaqr-V_sBp6LSFhb7WGgz6mNQOrllFgcmRiFqdi8I_BDHfhJe4ymZq4WIjBiw6Rc1y0-EtRXtPBZ19kL2f2ETQyXMtVGPTJu0am5jti_gaPBisLLYAZrDcGQCqLGlYjxyYhuFmvS-A-'],
    category: 'Tailoring',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Light Blue', hex: '#ADD8E6' }
    ],
    stock: 50,
    description: 'A crisp white organic cotton shirt with hidden placket. Clean, architectural lines.',
    tags: ['shirt', 'cotton', 'organic', 'tailoring', 'essential'],
    isNewArrival: true,
    isFeatured: false,
    specifications: {
      fabric: '100% Organic Cotton',
      lining: 'Unlined',
      closure: 'Hidden Button Placket',
      madeIn: 'Portugal'
    },
    care: ['Machine wash cold', 'Hang to dry', 'Medium heat iron']
  },
  {
    name: 'Obsidian Trench Coat',
    price: 620,
    originalPrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAnIZyOXyH0aea5MYAQKNFKp9y6wF7ncgk0z52UjmI_llQwhoYGLxHD3yQAqGctqU3khRSrgLsLAlfYYDtdZpdxZ7dwnQXLNI3BHyF3VpPi0_rPHn_6psig2MVR21jQiuTqa7NuXXDmiQ16yh_9nPtfmaxK0EXcF_aUV4Af0_5VWzHBvNwbAKQa3Ioaalpk5Qmv5MzoVRZ0PhBJCuhPeXmquUwqZRRNwR2XcukROIxj-EfyPitjNTuPE2z6v6jRMLDurzSmjd3gckpV'],
    category: 'Outerwear',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian', hex: '#000000' }
    ],
    stock: 20,
    description: 'A long trench coat in obsidian black technical fabric. Minimalist design with sharp architectural details.',
    tags: ['trench', 'coat', 'outerwear', 'black', 'technical'],
    isNewArrival: true,
    isFeatured: false,
    specifications: {
      fabric: 'Technical Performance Fabric',
      lining: 'Breathable Mesh',
      closure: 'Hidden Snap Buttons',
      madeIn: 'Japan'
    },
    care: ['Wipe clean with damp cloth', 'Do not machine wash', 'Hang to store']
  },
  {
    name: 'Asymmetric Silk Wrap Gown',
    price: 2450,
    originalPrice: 3100,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDHEZe-x1cTGmRTOqPfJHQrLBaPg5uYln-_LnHdSIHGQPP5XHkjzM5ofFJ2Z8z4R_bt5QsV35MYnj-7A-V5WLyMvMQThPxBh9UrtGVxOtEMVR6lG8-ghkwFywRxNKSo_mxYUM7G2X6GpYr3xMkZ_RPCjspTN9sPYu8Tc-x8NX2RhVXNqzJrctxDhy3n7rM4_BtO0bSgj8yCKepLwu28PYfxbo_aT1zcTMIjE7ExkwwEad6DvKt57_nE1LUgDC-_d30TTbrobjUTbBQs',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsIsEQaZlnL8iTeDUsZEagExnYdwoCFcELa3IoYtOn3Pu6FRvabq2YfTZzzDVPnwQdz8M6gbQxG9fq8NEBsx-3jaW0FHsOOfueDFAJzchBmRoZlJhCMDroBmxhfmLJQzhjcwSMcHyOtjit81afOlQDQDO9y2VSTbYAnk4z2hfQqD_XZCpDNkgVBuBprFGNY8O58WlV7TDUXK2ar5bPG0XHMSxq5bKityYbgAZxGi37Lc2aS3YN2bmnDKdRHd3JqmOSPPYg9fja5DIv'
    ],
    category: 'Dresses',
    sizes: ['FR 34', 'FR 36', 'FR 38', 'FR 40'],
    colors: [
      { name: 'Midnight Noir', hex: '#000000' },
      { name: 'Pearl', hex: '#E5E4E2' },
      { name: 'Slate', hex: '#5F6366' }
    ],
    stock: 8,
    description: 'A testament to structural elegance. Crafted from 40mm double-faced silk satin, each piece undergoes a 12-hour hand-draping process.',
    tags: ['gown', 'dress', 'silk', 'evening', 'asymmetric', 'luxury'],
    isNewArrival: false,
    isFeatured: true,
    specifications: {
      fabric: '100% Mulberry Silk',
      lining: 'Crêpe de Chine',
      closure: 'Concealed Side Zip',
      madeIn: 'Italy'
    },
    care: ['Professional dry clean only', 'Cool iron on reverse', 'Avoid contact with perfumes', 'Store in breathable garment bag']
  }
];

// Sample admin user
const adminUser = {
  name: 'Atelier Admin',
  email: 'admin@atelier.com',
  password: 'admin123',
  role: 'admin'
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({ email: adminUser.email });
    console.log('Cleared existing data');

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} products`);

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminUser.password, salt);
    const user = await User.create({
      name: adminUser.name,
      email: adminUser.email,
      passwordHash,
      role: adminUser.role
    });
    console.log(`Created admin user: ${user.email}`);

    console.log('\n=== Seed Complete ===');
    console.log('Products:', insertedProducts.length);
    console.log('Admin:', adminUser.email);
    console.log('Password:', adminUser.password);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();