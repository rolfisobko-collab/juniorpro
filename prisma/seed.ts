import "dotenv/config"

import { neonConfig } from "@neondatabase/serverless"
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "@prisma/client"

import WebSocket from "ws"

import bcrypt from "bcryptjs"

import { products } from "../lib/products-data"
import { categories as categoriesFromLib } from "../lib/categories-data"
import { carouselSlides } from "../lib/carousel-data"
import { defaultCTAs } from "../lib/ctas-data"
import { homeCategories } from "../lib/home-categories-data"
import { defaultLegalContent } from "../lib/legal-content-data"
import { brandingConfig } from "../lib/branding-data"
import { contactConfig } from "../lib/contact-data"
import { adminUsers } from "../lib/admin-users-data"

neonConfig.webSocketConstructor = WebSocket

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Seed requires DATABASE_URL in process.env (load .env).")
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString,
  }),
})

process.on("unhandledRejection", (reason) => {
  console.error("unhandledRejection", reason)
  process.exitCode = 1
})

process.on("uncaughtException", (error) => {
  console.error("uncaughtException", error)
  process.exitCode = 1
})

async function main() {
  for (const au of adminUsers) {
    const passwordHash = await bcrypt.hash(au.password, 10)
    await prisma.adminUser.upsert({
      where: { id: au.id },
      update: {
        email: au.email,
        username: au.username,
        name: au.name,
        passwordHash,
        role: au.role,
        permissions: au.permissions,
        active: au.active,
        lastLogin: au.lastLogin ? new Date(au.lastLogin) : null,
      },
      create: {
        id: au.id,
        email: au.email,
        username: au.username,
        name: au.name,
        passwordHash,
        role: au.role,
        permissions: au.permissions,
        active: au.active,
        createdAt: new Date(au.createdAt),
        lastLogin: au.lastLogin ? new Date(au.lastLogin) : null,
      },
    })
  }

  for (const c of categoriesFromLib) {
    await prisma.category.upsert({
      where: { key: c.slug },
      update: {
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
      },
      create: {
        key: c.slug,
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
      },
    })

    for (const sc of c.subcategories ?? []) {
      const id = sc.id ?? `${c.slug}-${sc.slug}`
      await prisma.subCategory.upsert({
        where: {
          categoryKey_slug: {
            categoryKey: c.slug,
            slug: sc.slug,
          },
        },
        update: {
          id,
          name: sc.name,
        },
        create: {
          id,
          name: sc.name,
          slug: sc.slug,
          categoryKey: c.slug,
        },
      })
    }
  }

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        categoryKey: p.category,
        price: p.price,
        image: p.image,
        description: p.description,
        brand: p.brand,
        rating: p.rating,
        reviews: p.reviews,
        inStock: p.inStock,
        stockQuantity: p.inStock ? 50 : 0,
        featured: p.featured ?? false,
      },
      create: {
        id: p.id,
        name: p.name,
        categoryKey: p.category,
        price: p.price,
        image: p.image,
        description: p.description,
        brand: p.brand,
        rating: p.rating,
        reviews: p.reviews,
        inStock: p.inStock,
        stockQuantity: p.inStock ? 50 : 0,
        featured: p.featured ?? false,
      },
    })
  }

  for (const s of carouselSlides) {
    await prisma.carouselSlide.upsert({
      where: { id: s.id },
      update: {
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        buttonText: s.buttonText,
        buttonLink: s.buttonLink,
        image: s.image,
        imageMobile: s.imageMobile,
        backgroundColor: s.backgroundColor,
        textColor: s.textColor,
        position: s.position,
        isActive: s.isActive,
      },
      create: {
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        buttonText: s.buttonText,
        buttonLink: s.buttonLink,
        image: s.image,
        imageMobile: s.imageMobile,
        backgroundColor: s.backgroundColor,
        textColor: s.textColor,
        position: s.position,
        isActive: s.isActive,
      },
    })
  }

  for (const cta of defaultCTAs) {
    await prisma.cta.upsert({
      where: { id: cta.id },
      update: {
        title: cta.title,
        description: cta.description,
        buttonText: cta.buttonText,
        buttonLink: cta.buttonLink,
        imageDesktop: cta.imageDesktop,
        imageMobile: cta.imageMobile,
        desktopWidth: cta.desktopWidth,
        desktopHeight: cta.desktopHeight,
        mobileWidth: cta.mobileWidth,
        mobileHeight: cta.mobileHeight,
        position: cta.position,
        isActive: cta.isActive,
        backgroundColor: cta.backgroundColor,
        textColor: cta.textColor,
      },
      create: {
        id: cta.id,
        title: cta.title,
        description: cta.description,
        buttonText: cta.buttonText,
        buttonLink: cta.buttonLink,
        imageDesktop: cta.imageDesktop,
        imageMobile: cta.imageMobile,
        desktopWidth: cta.desktopWidth,
        desktopHeight: cta.desktopHeight,
        mobileWidth: cta.mobileWidth,
        mobileHeight: cta.mobileHeight,
        position: cta.position,
        isActive: cta.isActive,
        backgroundColor: cta.backgroundColor,
        textColor: cta.textColor,
      },
    })
  }

  for (const hc of homeCategories) {
    await prisma.homeCategory.upsert({
      where: { id: hc.id },
      update: {
        name: hc.name,
        image: hc.image,
        link: hc.link,
        order: hc.order,
        active: hc.active,
      },
      create: {
        id: hc.id,
        name: hc.name,
        image: hc.image,
        link: hc.link,
        order: hc.order,
        active: hc.active,
      },
    })
  }

  for (const lc of defaultLegalContent) {
    await prisma.legalContent.upsert({
      where: { id: lc.id },
      update: {
        slug: lc.slug,
        title: lc.title,
        content: lc.content,
        lastUpdated: lc.lastUpdated,
      },
      create: {
        id: lc.id,
        slug: lc.slug,
        title: lc.title,
        content: lc.content,
        lastUpdated: lc.lastUpdated,
      },
    })
  }

  await prisma.brandingSetting.upsert({
    where: { id: brandingConfig.id },
    update: {
      siteName: brandingConfig.siteName,
      logoText: brandingConfig.logoText,
      logoImage: brandingConfig.logoImage || null,
      faviconImage: brandingConfig.faviconImage || null,
      primaryColor: brandingConfig.primaryColor || null,
      updatedAt: brandingConfig.updatedAt,
    },
    create: {
      id: brandingConfig.id,
      siteName: brandingConfig.siteName,
      logoText: brandingConfig.logoText,
      logoImage: brandingConfig.logoImage || null,
      faviconImage: brandingConfig.faviconImage || null,
      primaryColor: brandingConfig.primaryColor || null,
      updatedAt: brandingConfig.updatedAt,
    },
  })

  await prisma.contactInformation.upsert({
    where: { id: contactConfig.id },
    update: {
      description: contactConfig.description,
      address: contactConfig.address,
      city: contactConfig.city,
      country: contactConfig.country,
      phone: contactConfig.phone,
      email: contactConfig.email,
      weekdays: contactConfig.workingHours.weekdays,
      saturday: contactConfig.workingHours.saturday,
      updatedAt: contactConfig.updatedAt,
    },
    create: {
      id: contactConfig.id,
      description: contactConfig.description,
      address: contactConfig.address,
      city: contactConfig.city,
      country: contactConfig.country,
      phone: contactConfig.phone,
      email: contactConfig.email,
      weekdays: contactConfig.workingHours.weekdays,
      saturday: contactConfig.workingHours.saturday,
      updatedAt: contactConfig.updatedAt,
    },
  })

  for (const sl of contactConfig.socialLinks) {
    await prisma.socialLink.upsert({
      where: { id: `${contactConfig.id}-${sl.platform}` },
      update: {
        platform: sl.platform,
        url: sl.url,
        enabled: sl.enabled,
        contactInformationId: contactConfig.id,
      },
      create: {
        id: `${contactConfig.id}-${sl.platform}`,
        platform: sl.platform,
        url: sl.url,
        enabled: sl.enabled,
        contactInformationId: contactConfig.id,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
