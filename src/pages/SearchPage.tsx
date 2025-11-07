import React, { useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CombinedRecipeSearch from "../components/CombinedRecipeSearch";
import SearchingRecipes from "../components/SearchingRecipes";
import PopularRecipes from "../components/PopularRecipes";

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useState<{
    keyword?: string;
    ingredients?: string[];
    cuisine?: string;
    category?: string;
    tags?: string[];
  } | null>(null);

  const handleSearch = (params: {
    keyword?: string;
    ingredients?: string[];
    cuisine?: string;
    category?: string;
    tags?: string[];
  } | null) => {
    setSearchParams(params);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        <CombinedRecipeSearch onSearch={handleSearch} />

        {searchParams ? (
          <SearchingRecipes
            searchParams={searchParams.keyword ? searchParams : undefined}
            ingredients={searchParams.ingredients}
            cuisine={searchParams.cuisine}
            category={searchParams.category}
            tags={searchParams.tags}
          />
        ) : (
          <PopularRecipes />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchPage;
