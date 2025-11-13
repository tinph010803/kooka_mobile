import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { normalizeRecipeFromPython } from "../../utils/adapters";
import axiosInstance from "../../utils/axiosInstance";

// =====================
// TYPES
// =====================

export interface IngredientType {
  _id: string;
  name: string;
}

export interface Ingredient {
  _id: string;
  name: string;
  typeId: string;
}

export interface Tag {
  _id: string;
  name: string;
}

export interface Cuisine {
  _id: string;
  name: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface Instruction {
  title: string;
  images: string[];
  subTitle: string[];
}

export interface Recipe {
  _id: string;
  name: string;
  ingredients: Ingredient[];
  tags: Tag[];
  short: string;
  instructions: Instruction[];
  image: string;
  video: string;
  calories: number;
  time: number;
  size: number;
  difficulty: string;
  cuisine: Cuisine;
  category: Category;
  rate: number;
  numberOfRate: number;
  createdAt?: string;
  updatedAt?: string;
}

interface RecipeState {
  recipes: Recipe[]; // Tất cả recipes từ fetchRecipes (KHÔNG có instructions)
  currentRecipe: Recipe | null; // Recipe đang xem chi tiết (CÓ đầy đủ instructions)
  searchResults: Recipe[]; // Kết quả tìm kiếm từ searchRecipes/searchRecipesByKeyword
  topRatedRecipes: Recipe[]; // Top-rated recipes cho banner
  newestRecipes: Recipe[]; // Newest recipes cho section Món Ăn Mới
  popularRecipes: Recipe[]; // Popular recipes cho section Món Ăn Phổ Biến
  trendingRecipes: Recipe[]; // Trending recipes cho section Sôi Nổi Nhất
  ingredients: Ingredient[];
  ingredientTypes: IngredientType[];
  tags: Tag[];
  cuisines: Cuisine[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

// =====================
// INITIAL STATE
// =====================

const initialState: RecipeState = {
  recipes: [],
  currentRecipe: null,
  searchResults: [],
  topRatedRecipes: [],
  newestRecipes: [],
  popularRecipes: [],
  trendingRecipes: [],
  ingredients: [],
  ingredientTypes: [],
  tags: [],
  cuisines: [],
  categories: [],
  loading: false,
  error: null,
};

// =====================
// SEARCH TYPES
// =====================

interface SearchPayload {
  ingredients?: string[];
  tags?: string[];
  cuisine?: string;
  category?: string;
  top_k?: number;
}

interface KeywordSearchPayload {
  keywords: string;
  tags?: string[];
  cuisine?: string;
  category?: string;
  top_k?: number;
}

// =====================
// RECIPE API CALLS
// =====================

export const searchRecipes = createAsyncThunk(
  "recipes/search",
  async (payload: SearchPayload) => {
    const res = await axiosInstance.post("/search", payload, {
      headers: { "Content-Type": "application/json" },
    });
    // Backend trả về { query: string, hits: [...] }
    return res.data.hits.map(normalizeRecipeFromPython);
  }
);

export const searchRecipesByKeyword = createAsyncThunk(
  "recipes/searchByKeyword",
  async (payload: KeywordSearchPayload) => {
    const res = await axiosInstance.post("/search/search-by-keyword", payload, {
      headers: { "Content-Type": "application/json" },
    });
    // Backend trả về { query: string, hits: [...] }
    return res.data.hits.map(normalizeRecipeFromPython);
  }
);

export const fetchRecipes = createAsyncThunk("recipes/fetchAll", async () => {
  const res = await axiosInstance.get(`/recipes`);
  return res.data as Recipe[];
});

export const fetchTopRatedRecipes = createAsyncThunk("recipes/fetchTopRated", async (limit: number = 6) => {
  const res = await axiosInstance.get(`/recipes/top-rated?limit=${limit}`);
  return res.data as Recipe[];
});

export const fetchNewestRecipes = createAsyncThunk("recipes/fetchNewest", async (limit?: number) => {
  const endpoint = limit ? `/recipes/newest?limit=${limit}` : `/recipes/newest`;
  const res = await axiosInstance.get(endpoint);
  return res.data as Recipe[];
});

export const fetchPopularRecipes = createAsyncThunk("recipes/fetchPopular", async (limit?: number) => {
  const endpoint = limit ? `/recipes/popular?limit=${limit}` : `/recipes/popular`;
  const res = await axiosInstance.get(endpoint);
  return res.data as Recipe[];
});

export const fetchTrendingRecipes = createAsyncThunk("recipes/fetchTrending", async () => {
  const res = await axiosInstance.get(`/recipes/trending`);
  return res.data as Recipe[];
});

export const getRecipeById = createAsyncThunk("recipes/fetchById", async (id: string) => {
  const res = await axiosInstance.get(`/recipes/${id}`);
  return res.data as Recipe;
});

export const addRecipe = createAsyncThunk(
  "recipes/add", 
  async (recipe: Omit<Recipe, "_id">, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/recipes`, recipe);
      return res.data as Recipe;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add recipe');
    }
  }
);

export const updateRecipe = createAsyncThunk(
  "recipes/update",
  async ({ id, recipe }: { id: string; recipe: Partial<Recipe> }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/recipes/${id}`, recipe);
      return res.data as Recipe;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update recipe');
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  "recipes/delete", 
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/recipes/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete recipe');
    }
  }
);

// =====================
// INGREDIENT API CALLS
// =====================

export const fetchIngredients = createAsyncThunk("ingredients/fetchAll", async () => {
  const res = await axiosInstance.get(`/ingredients`);
  return res.data as Ingredient[];
});

export const getIngredientsByType = createAsyncThunk("ingredients/fetchByType", async (typeId: string) => {
  const res = await axiosInstance.get(`/ingredients/type/${typeId}`);
  return res.data as Ingredient[];
});

export const getIngredientById = createAsyncThunk("ingredients/fetchById", async (id: string) => {
  const res = await axiosInstance.get(`/ingredients/${id}`);
  return res.data as Ingredient;
});

export const addIngredient = createAsyncThunk(
  "ingredients/add",
  async ({ name, typeId }: { name: string; typeId: string }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/ingredients`, { name, typeId });
      return res.data as Ingredient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add ingredient');
    }
  }
);

export const updateIngredient = createAsyncThunk(
  "ingredients/update",
  async ({ id, ingredient }: { id: string; ingredient: Partial<Ingredient> }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/ingredients/${id}`, ingredient);
      return res.data as Ingredient;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update ingredient');
    }
  }
);

export const deleteIngredient = createAsyncThunk(
  "ingredients/delete", 
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/ingredients/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete ingredient');
    }
  }
);

// =====================
// INGREDIENT TYPE API CALLS
// =====================

export const fetchIngredientTypes = createAsyncThunk("ingredientTypes/fetchAll", async () => {
  const res = await axiosInstance.get(`/ingredient-types`);
  return res.data as IngredientType[];
});

export const getIngredientTypeById = createAsyncThunk("ingredientTypes/fetchById", async (id: string) => {
  const res = await axiosInstance.get(`/ingredient-types/${id}`);
  return res.data as IngredientType;
});

export const addIngredientType = createAsyncThunk(
  "ingredientTypes/add", 
  async (name: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/ingredient-types`, { name });
      return res.data as IngredientType;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add ingredient type');
    }
  }
);

export const updateIngredientType = createAsyncThunk(
  "ingredientTypes/update",
  async ({ id, type }: { id: string; type: Partial<IngredientType> }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/ingredient-types/${id}`, type);
      return res.data as IngredientType;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update ingredient type');
    }
  }
);

export const deleteIngredientType = createAsyncThunk(
  "ingredientTypes/delete", 
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/ingredient-types/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete ingredient type');
    }
  }
);

// =====================
// TAG API CALLS
// =====================

export const fetchTags = createAsyncThunk("tags/fetchAll", async () => {
  const res = await axiosInstance.get(`/tags`);
  return res.data as Tag[];
});

export const getTagById = createAsyncThunk("tags/fetchById", async (id: string) => {
  const res = await axiosInstance.get(`/tags/${id}`);
  return res.data as Tag;
});

export const addTag = createAsyncThunk(
  "tags/add", 
  async (name: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/tags`, { name });
      return res.data as Tag;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add tag');
    }
  }
);

export const deleteTag = createAsyncThunk(
  "tags/delete", 
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tags/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete tag');
    }
  }
);

export const updateTag = createAsyncThunk(
  "tags/update", 
  async ({ id, tag }: { id: string; tag: Partial<Tag> }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/tags/${id}`, tag);
      return res.data as Tag;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update tag');
    }
  }
);

// =====================
// CUISINE API CALLS
// =====================

export const fetchCuisines = createAsyncThunk("cuisines/fetchAll", async () => {
  const res = await axiosInstance.get(`/cuisines`);
  return res.data as Cuisine[];
});

export const getCuisineById = createAsyncThunk("cuisines/fetchById", async (id: string) => {
  const res = await axiosInstance.get(`/cuisines/${id}`);
  return res.data as Cuisine;
});

export const addCuisine = createAsyncThunk(
  "cuisines/add", 
  async (name: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/cuisines`, { name });
      return res.data as Cuisine;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add cuisine');
    }
  }
);

export const deleteCuisine = createAsyncThunk(
  "cuisines/delete", 
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/cuisines/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete cuisine');
    }
  }
);

export const updateCuisine = createAsyncThunk(
  "cuisines/update", 
  async ({ id, cuisine }: { id: string; cuisine: Partial<Cuisine> }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/cuisines/${id}`, cuisine);
      return res.data as Cuisine;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update cuisine');
    }
  }
);

// =====================
// CATEGORY API CALLS
// =====================

export const fetchCategories = createAsyncThunk("categories/fetchAll", async () => {
  const res = await axiosInstance.get(`/categories`);
  return res.data as Category[];
});

export const getCategoryById = createAsyncThunk("categories/fetchById", async (id: string) => {
  const res = await axiosInstance.get(`/categories/${id}`);
  return res.data as Category;
});

export const addCategory = createAsyncThunk(
  "categories/add", 
  async (name: string, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/categories`, { name });
      return res.data as Category;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete", 
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/categories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update", 
  async ({ id, category }: { id: string; category: Partial<Category> }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/categories/${id}`, category);
      return res.data as Category;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update category');
    }
  }
);

// =====================
// SLICE
// =====================

const recipeSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Recipes
    builder
      .addCase(fetchRecipes.fulfilled, (state, action: PayloadAction<Recipe[]>) => {
        state.recipes = action.payload;
        state.loading = false;
      })
      .addCase(fetchTopRatedRecipes.fulfilled, (state, action: PayloadAction<Recipe[]>) => {
        state.topRatedRecipes = action.payload;
        state.loading = false;
      })
      .addCase(fetchNewestRecipes.fulfilled, (state, action: PayloadAction<Recipe[]>) => {
        state.newestRecipes = action.payload;
        state.loading = false;
      })
      .addCase(fetchPopularRecipes.fulfilled, (state, action: PayloadAction<Recipe[]>) => {
        state.popularRecipes = action.payload;
        state.loading = false;
      })
      .addCase(fetchTrendingRecipes.fulfilled, (state, action: PayloadAction<Recipe[]>) => {
        state.trendingRecipes = action.payload;
        state.loading = false;
      })
      .addCase(searchRecipes.fulfilled, (state, action: PayloadAction<Recipe[]>) => {
        state.searchResults = action.payload; // Lưu vào searchResults thay vì recipes
        state.loading = false;
      })
      .addCase(searchRecipesByKeyword.fulfilled, (state, action: PayloadAction<Recipe[]>) => {
        state.searchResults = action.payload; // Lưu vào searchResults thay vì recipes
        state.loading = false;
      })
      .addCase(getRecipeById.fulfilled, (state, action: PayloadAction<Recipe>) => {
        // Lưu vào currentRecipe để RecipeDetail dùng (CÓ đầy đủ instructions)
        state.currentRecipe = action.payload;
        
        // Cập nhật hoặc thêm vào recipes array nếu cần
        const index = state.recipes.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          // Cập nhật recipe đã tồn tại với data đầy đủ
          state.recipes[index] = action.payload;
        } else {
          // Thêm recipe mới (trường hợp user truy cập trực tiếp URL)
          state.recipes.push(action.payload);
        }
        state.loading = false;
      })
      .addCase(addRecipe.fulfilled, (state, action: PayloadAction<Recipe>) => {
        state.recipes.push(action.payload);
        state.loading = false;
      })
      .addCase(updateRecipe.fulfilled, (state, action: PayloadAction<Recipe>) => {
        const index = state.recipes.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) state.recipes[index] = action.payload;
        state.loading = false;
      })
      .addCase(deleteRecipe.fulfilled, (state, action: PayloadAction<string>) => {
        state.recipes = state.recipes.filter((r) => r._id !== action.payload);
        state.loading = false;
      });

    // Ingredients
    builder
      .addCase(fetchIngredients.fulfilled, (state, action: PayloadAction<Ingredient[]>) => {
        state.ingredients = action.payload;
        state.loading = false;
      })
      .addCase(getIngredientsByType.fulfilled, (state, action: PayloadAction<Ingredient[]>) => {
        state.ingredients = action.payload;
        state.loading = false;
      })
      .addCase(getIngredientById.fulfilled, (state, action: PayloadAction<Ingredient>) => {
        const existing = state.ingredients.find((i) => i._id === action.payload._id);
        if (!existing) state.ingredients.push(action.payload);
        state.loading = false;
      })
      .addCase(addIngredient.fulfilled, (state, action: PayloadAction<Ingredient>) => {
        state.ingredients.push(action.payload);
        state.loading = false;
      })
      .addCase(updateIngredient.fulfilled, (state, action: PayloadAction<Ingredient>) => {
        const index = state.ingredients.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) state.ingredients[index] = action.payload;
        state.loading = false;
      })
      .addCase(deleteIngredient.fulfilled, (state, action: PayloadAction<string>) => {
        state.ingredients = state.ingredients.filter((i) => i._id !== action.payload);
        state.loading = false;
      });

    // Ingredient Types
    builder
      .addCase(fetchIngredientTypes.fulfilled, (state, action: PayloadAction<IngredientType[]>) => {
        state.ingredientTypes = action.payload;
        state.loading = false;
      })
      .addCase(getIngredientTypeById.fulfilled, (state, action: PayloadAction<IngredientType>) => {
        const existing = state.ingredientTypes.find((t) => t._id === action.payload._id);
        if (!existing) state.ingredientTypes.push(action.payload);
        state.loading = false;
      })
      .addCase(addIngredientType.fulfilled, (state, action: PayloadAction<IngredientType>) => {
        state.ingredientTypes.push(action.payload);
        state.loading = false;
      })
      .addCase(updateIngredientType.fulfilled, (state, action: PayloadAction<IngredientType>) => {
        const index = state.ingredientTypes.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.ingredientTypes[index] = action.payload;
        state.loading = false;
      })
      .addCase(deleteIngredientType.fulfilled, (state, action: PayloadAction<string>) => {
        state.ingredientTypes = state.ingredientTypes.filter((t) => t._id !== action.payload);
        state.loading = false;
      });

    // Tags
    builder
      .addCase(fetchTags.fulfilled, (state, action: PayloadAction<Tag[]>) => {
        state.tags = action.payload;
        state.loading = false;
      })
      .addCase(getTagById.fulfilled, (state, action: PayloadAction<Tag>) => {
        const existing = state.tags.find((t) => t._id === action.payload._id);
        if (!existing) state.tags.push(action.payload);
        state.loading = false;
      })
      .addCase(addTag.fulfilled, (state, action: PayloadAction<Tag>) => {
        state.tags.push(action.payload);
        state.loading = false;
      })
      .addCase(updateTag.fulfilled, (state, action: PayloadAction<Tag>) => {
        const index = state.tags.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.tags[index] = action.payload;
        state.loading = false;
      })
      .addCase(deleteTag.fulfilled, (state, action: PayloadAction<string>) => {
        state.tags = state.tags.filter((t) => t._id !== action.payload);
        state.loading = false;
      });

    // Cuisines
    builder
      .addCase(fetchCuisines.fulfilled, (state, action: PayloadAction<Cuisine[]>) => {
        state.cuisines = action.payload;
        state.loading = false;
      })
      .addCase(getCuisineById.fulfilled, (state, action: PayloadAction<Cuisine>) => {
        const existing = state.cuisines.find((c) => c._id === action.payload._id);
        if (!existing) state.cuisines.push(action.payload);
        state.loading = false;
      })
      .addCase(addCuisine.fulfilled, (state, action: PayloadAction<Cuisine>) => {
        state.cuisines.push(action.payload);
        state.loading = false;
      })
      .addCase(updateCuisine.fulfilled, (state, action: PayloadAction<Cuisine>) => {
        const index = state.cuisines.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.cuisines[index] = action.payload;
        state.loading = false;
      })
      .addCase(deleteCuisine.fulfilled, (state, action: PayloadAction<string>) => {
        state.cuisines = state.cuisines.filter((c) => c._id !== action.payload);
        state.loading = false;
      });

    // Categories
    builder
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(getCategoryById.fulfilled, (state, action: PayloadAction<Category>) => {
        const existing = state.categories.find((c) => c._id === action.payload._id);
        if (!existing) state.categories.push(action.payload);
        state.loading = false;
      })
      .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        state.categories.push(action.payload);
        state.loading = false;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.categories[index] = action.payload;
        state.loading = false;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
        state.categories = state.categories.filter((c) => c._id !== action.payload);
        state.loading = false;
      });

    // Generic pending/rejected - Only for recipe-related actions
    builder
      .addMatcher(
        (action) => action.type.startsWith("recipes/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("recipes/") && action.type.endsWith("/rejected"),
        (state, action: { error?: { message?: string } }) => {
          state.loading = false;
          state.error = action.error?.message || "Something went wrong";
        }
      )
      .addMatcher(
        (action) => (action.type.startsWith("ingredients/") ||
          action.type.startsWith("ingredientTypes/") ||
          action.type.startsWith("tags/") ||
          action.type.startsWith("cuisines/") ||
          action.type.startsWith("categories/")) && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => (action.type.startsWith("ingredients/") ||
          action.type.startsWith("ingredientTypes/") ||
          action.type.startsWith("tags/") ||
          action.type.startsWith("cuisines/") ||
          action.type.startsWith("categories/")) && action.type.endsWith("/rejected"),
        (state, action: { error?: { message?: string } }) => {
          state.loading = false;
          state.error = action.error?.message || "Something went wrong";
        }
      );
  },
});

export default recipeSlice.reducer;
