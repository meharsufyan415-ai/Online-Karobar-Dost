import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ReceiptData {
  item_name: string;
  amount: number;
  category: string;
  date: string;
  confidence_score: number;
}

export async function scanReceipt(base64Image: string): Promise<ReceiptData | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image,
              },
            },
            {
              text: `Extract information from this receipt. Return a strictly formatted JSON object with:
              item_name: Name of the expense.
              amount: Numeric value only.
              category: (Marketing, Stock, Utility, Delivery, Others).
              date: Transaction date (YYYY-MM-DD).
              confidence_score: Your certainty level (0.0 to 1.0).
              
              If information is missing, provide best guesses or null.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as ReceiptData;
  } catch (error) {
    console.error("Error scanning receipt:", error);
    return null;
  }
}

export async function getExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
  // In a real app, we'd use an API like ExchangeRate-API or similar.
  // For this demo, we simulate fetching rates with a slight random variation.
  try {
    const variation = () => (Math.random() * 0.02 - 0.01); // +/- 1% variation
    
    const rates: Record<string, number> = {
      'PKR': 1,
      'USD': 0.0036 * (1 + variation()),
      'AED': 0.013 * (1 + variation()),
      'GBP': 0.0028 * (1 + variation()),
      'EUR': 0.0033 * (1 + variation())
    };
    
    if (baseCurrency !== 'PKR') {
      const baseRate = rates[baseCurrency];
      Object.keys(rates).forEach(key => {
        rates[key] = rates[key] / baseRate;
      });
    }
    
    return rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return { 'PKR': 1 };
  }
}
