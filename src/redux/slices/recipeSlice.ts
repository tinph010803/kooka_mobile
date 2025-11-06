import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "./authSlice";

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
  typeId?: string;
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
  step: number;
  description: string;
  image?: string;
}

export interface Recipe {
  _id: string;
  name: string;
  short?: string;
  image: string;
  video?: string;
  calories?: number;
  time?: number;
  size?: number;
  difficulty?: string;
  cuisine?: Cuisine;
  category?: Category;
  rate?: number;
  numberOfRate?: number;
  ingredients?: Ingredient[];
  tags?: Tag[];
  instructions?: Instruction[];
  favorites?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  topRated: Recipe[];
  newest: Recipe[];
  popular: Recipe[];
  trending: Recipe[];
  searchResults: Recipe[];
  ingredients: Ingredient[];
  ingredientTypes: IngredientType[];
  tags: Tag[];
  cuisines: Cuisine[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// =====================
// INITIAL STATE
// =====================

const initialState: RecipeState = {
  recipes: [],
  currentRecipe: null,
  topRated: [],
  newest: [],
  popular: [],
  trending: [],
  searchResults: [],
  ingredients: [],
  ingredientTypes: [],
  tags: [],
  cuisines: [],
  categories: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// =====================
// SEARCH TYPES
// =====================

interface SearchPayload {
  ingredientIds?: string[];
  tagIds?: string[];
  cuisineId?: string;
  categoryId?: string;
  difficulty?: string;
  minTime?: number;
  maxTime?: number;
  page?: number;
  limit?: number;
}

interface KeywordSearchPayload {
  keyword: string;
  page?: number;
  limit?: number;
}

// =====================
// RECIPE API CALLS
// =====================

export const searchRecipes = createAsyncThunk(
  "recipes/search",
  async (payload: SearchPayload) => {
    const res = await apiClient.post("/recipes/search", payload);
    return res.data;
  }
);

export const searchRecipesByKeyword = createAsyncThunk(
  "recipes/searchByKeyword",
  async (payload: KeywordSearchPayload) => {
    const res = await apiClient.get("/recipes/search", { params: payload });
    return res.data;
  }
);

export const fetchRecipes = createAsyncThunk("recipes/fetchAll", async () => {
  const res = await apiClient.get("/recipes");
  return res.data;
});

export const fetchTopRatedRecipes = createAsyncThunk(
  "recipes/fetchTopRated",
  async (limit: number = 6) => {
    const res = await apiClient.get(`/recipes/top-rated?limit=${limit}`);
    return res.data;
  }
);

export const fetchNewestRecipes = createAsyncThunk(
  "recipes/fetchNewest",
  async (limit?: number) => {
    const res = await apiClient.get(`/recipes/newest${limit ? `?limit=${limit}` : ""}`);
    return res.data;
  }
);

export const fetchPopularRecipes = createAsyncThunk(
  "recipes/fetchPopular",
  async (limit?: number) => {
    const res = await apiClient.get(`/recipes/popular${limit ? `?limit=${limit}` : ""}`);
    return res.data;
  }
);

export const fetchTrendingRecipes = createAsyncThunk("recipes/fetchTrending", async () => {
  const res = await apiClient.get("/recipes/trending");
  return res.data;
});

export const getRecipeById = createAsyncThunk("recipes/fetchById", async (id: string) => {
  const res = await apiClient.get(`/recipes/${id}`);
  return res.data;
});

export const addRecipe = createAsyncThunk(
  "recipes/add",
  async (recipe: Omit<Recipe, "_id">, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/recipes", recipe);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add recipe");
    }
  }
);

export const updateRecipe = createAsyncThunk(
  "recipes/update",
  async ({ id, recipe }: { id: string; recipe: Partial<Recipe> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/recipes/${id}`, recipe);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update recipe");
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  "recipes/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/recipes/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete recipe");
    }
  }
);

// =====================
// INGREDIENT API CALLS
// =====================

export const fetchIngredients = createAsyncThunk("ingredients/fetchAll", async () => {
  const res = await apiClient.get("/ingredients");
  return res.data;
});

export const getIngredientsByType = createAsyncThunk(
  "ingredients/fetchByType",
  async (typeId: string) => {
    const res = await apiClient.get(`/ingredients/type/${typeId}`);
    return res.data;
  }
);

export const getIngredientById = createAsyncThunk("ingredients/fetchById", async (id: string) => {
  const res = await apiClient.get(`/ingredients/${id}`);
  return res.data;
});

export const addIngredient = createAsyncThunk(
  "ingredients/add",
  async ({ name, typeId }: { name: string; typeId: string }, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/ingredients", { name, typeId });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add ingredient");
    }
  }
);

export const updateIngredient = createAsyncThunk(
  "ingredients/update",
  async ({ id, ingredient }: { id: string; ingredient: Partial<Ingredient> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/ingredients/${id}`, ingredient);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update ingredient");
    }
  }
);

export const deleteIngredient = createAsyncThunk(
  "ingredients/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/ingredients/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete ingredient");
    }
  }
);

// =====================
// INGREDIENT TYPE API CALLS
// =====================

export const fetchIngredientTypes = createAsyncThunk("ingredientTypes/fetchAll", async () => {
  const res = await apiClient.get("/ingredient-types");
  return res.data;
});

export const getIngredientTypeById = createAsyncThunk(
  "ingredientTypes/fetchById",
  async (id: string) => {
    const res = await apiClient.get(`/ingredient-types/${id}`);
    return res.data;
  }
);

export const addIngredientType = createAsyncThunk(
  "ingredientTypes/add",
  async (name: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/ingredient-types", { name });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add ingredient type");
    }
  }
);

export const updateIngredientType = createAsyncThunk(
  "ingredientTypes/update",
  async ({ id, type }: { id: string; type: Partial<IngredientType> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/ingredient-types/${id}`, type);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update ingredient type");
    }
  }
);

export const deleteIngredientType = createAsyncThunk(
  "ingredientTypes/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/ingredient-types/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete ingredient type");
    }
  }
);

// =====================
// TAG API CALLS
// =====================

export const fetchTags = createAsyncThunk("tags/fetchAll", async () => {
  const res = await apiClient.get("/tags");
  return res.data;
});

export const getTagById = createAsyncThunk("tags/fetchById", async (id: string) => {
  const res = await apiClient.get(`/tags/${id}`);
  return res.data;
});

export const addTag = createAsyncThunk(
  "tags/add",
  async (name: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/tags", { name });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add tag");
    }
  }
);

export const deleteTag = createAsyncThunk(
  "tags/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/tags/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete tag");
    }
  }
);

export const updateTag = createAsyncThunk(
  "tags/update",
  async ({ id, tag }: { id: string; tag: Partial<Tag> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/tags/${id}`, tag);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update tag");
    }
  }
);

// =====================
// CUISINE API CALLS
// =====================

export const fetchCuisines = createAsyncThunk("cuisines/fetchAll", async () => {
  const res = await apiClient.get("/cuisines");
  return res.data;
});

export const getCuisineById = createAsyncThunk("cuisines/fetchById", async (id: string) => {
  const res = await apiClient.get(`/cuisines/${id}`);
  return res.data;
});

export const addCuisine = createAsyncThunk(
  "cuisines/add",
  async (name: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/cuisines", { name });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add cuisine");
    }
  }
);

export const deleteCuisine = createAsyncThunk(
  "cuisines/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/cuisines/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete cuisine");
    }
  }
);

export const updateCuisine = createAsyncThunk(
  "cuisines/update",
  async ({ id, cuisine }: { id: string; cuisine: Partial<Cuisine> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/cuisines/${id}`, cuisine);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update cuisine");
    }
  }
);

// =====================
// CATEGORY API CALLS
// =====================

export const fetchCategories = createAsyncThunk("categories/fetchAll", async () => {
  const res = await apiClient.get("/categories");
  return res.data;
});

export const getCategoryById = createAsyncThunk("categories/fetchById", async (id: string) => {
  const res = await apiClient.get(`/categories/${id}`);
  return res.data;
});

export const addCategory = createAsyncThunk(
  "categories/add",
  async (name: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/categories", { name });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add category");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/categories/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete category");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ id, category }: { id: string; category: Partial<Category> }, { rejectWithValue }) => {
    try {
      const res = await apiClient.put(`/categories/${id}`, category);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update category");
    }
  }
);

// =====================
// SLICE
// =====================

const recipeSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    clearRecipes: (state) => {
      state.recipes = [];
      state.searchResults = [];
      state.error = null;
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRecipe: (state, action: PayloadAction<Recipe>) => {
      state.currentRecipe = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH ALL RECIPES
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch recipes";
      })

      // FETCH TOP RATED
      .addCase(fetchTopRatedRecipes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopRatedRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.topRated = action.payload;
      })
      .addCase(fetchTopRatedRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch top rated recipes";
      })

      // FETCH NEWEST
      .addCase(fetchNewestRecipes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNewestRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.newest = action.payload;
      })
      .addCase(fetchNewestRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch newest recipes";
      })

      // FETCH POPULAR
      .addCase(fetchPopularRecipes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPopularRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.popular = action.payload;
      })
      .addCase(fetchPopularRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch popular recipes";
      })

      // FETCH TRENDING
      .addCase(fetchTrendingRecipes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrendingRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.trending = action.payload;
      })
      .addCase(fetchTrendingRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch trending recipes";
      })

      // GET RECIPE BY ID
      .addCase(getRecipeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecipeById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecipe = action.payload;
      })
      .addCase(getRecipeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch recipe";
      })

      // SEARCH RECIPES
      .addCase(searchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.recipes || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to search recipes";
      })

      // SEARCH BY KEYWORD
      .addCase(searchRecipesByKeyword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRecipesByKeyword.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.recipes || action.payload;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(searchRecipesByKeyword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to search recipes";
      })

      // ADD RECIPE
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.recipes.push(action.payload);
      })

      // UPDATE RECIPE
      .addCase(updateRecipe.fulfilled, (state, action) => {
        const index = state.recipes.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.recipes[index] = action.payload;
        }
        if (state.currentRecipe?._id === action.payload._id) {
          state.currentRecipe = action.payload;
        }
      })

      // DELETE RECIPE
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.recipes = state.recipes.filter((r) => r._id !== action.payload);
        if (state.currentRecipe?._id === action.payload) {
          state.currentRecipe = null;
        }
      })

      // FETCH INGREDIENTS
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.ingredients = action.payload;
      })

      // FETCH INGREDIENT TYPES
      .addCase(fetchIngredientTypes.fulfilled, (state, action) => {
        state.ingredientTypes = action.payload;
      })

      // FETCH TAGS
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload;
      })

      // FETCH CUISINES
      .addCase(fetchCuisines.fulfilled, (state, action) => {
        state.cuisines = action.payload;
      })

      // FETCH CATEGORIES
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const { clearRecipes, clearCurrentRecipe, clearError, setCurrentRecipe } =
  recipeSlice.actions;
export default recipeSlice.reducer;
