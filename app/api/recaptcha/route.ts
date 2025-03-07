import { NextResponse } from 'next/server';

const RECAPTCHA_SECRET_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
      {
        method: 'POST',
      }
    );

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid reCAPTCHA' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Failed to verify reCAPTCHA:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify reCAPTCHA' },
      { status: 500 }
    );
  }
}