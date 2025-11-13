// utils/adapters.ts
import type { Recipe } from "../redux/slices/recipeSlice";

export function normalizeRecipeFromPython(data: any): Recipe {
    return {
        _id: data.id || "", 
        name: data.name || "",
        short: data.short || "",
        image: data.image || "",
        video: data.video || "",
        calories: data.calories || 0,
        time: data.time || 0,
        size: data.size || 0,
        difficulty: data.difficulty || "",
        cuisine: { _id: "", name: data.cuisine || "" }, // wrap string thành object
        category: { _id: "", name: data.category || "" },
        rate: data.rate || 0,
        numberOfRate: data.numberOfRate || 0,
        ingredients: Array.isArray(data.ingredients)
            ? data.ingredients.map((ing: string, idx: number) => ({
                _id: String(idx), // fake id
                name: ing,
            }))
            : [],
        tags: [], // Python không trả thì để rỗng
        instructions: [], // nếu Python chưa trả thì để rỗng
    };
}
