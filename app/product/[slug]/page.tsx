import { Suspense } from "react";
import { Metadata } from "next";
import { db } from "@/src/config/FirebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import ProductDetailMain from "./main";
import ProductDetailSkeleton from "@/src/components/ProductDetailSkeleton";
import Navbar from "@/src/components/Navbar";
import Footer from "@/src/components/Footer";

interface PageProps {
  params: Promise<{
    slug: string;
    searchParams?: { [key: string]: string | string[] | undefined };
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const productDoc = querySnapshot.docs[0];
      const productData = productDoc.data();

      return {
        title: productData.name,
        description: productData.description || `Detail produk ${productData.name}`,
        openGraph: {
          title: productData.name,
          description: productData.description,
          images: [productData.images[0]],
        },
      };
    }

    return {
      title: "Produk Tidak Ditemukan",
      description: "Halaman produk tidak tersedia",
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return {
      title: "Error",
      description: "Terjadi kesalahan saat memuat produk",
    };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <>
      <Navbar />
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailMain slug={slug} />
      </Suspense>
      <Footer />
    </>
  );
}
