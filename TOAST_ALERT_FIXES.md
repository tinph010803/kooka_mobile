# 🔧 Fix Toast & Alert Issues

## ❌ Vấn đề gặp phải:

### 1. **Toast text2 bị cắt ngắn (...)**
- Text dài bị cắt sau 2-3 dòng
- User không đọc được đủ thông tin
- Ví dụ: "Bạn đã có 3 kế hoạch chưa hoàn thành. Vui lòng hoàn thành..." (bị ...)

### 2. **Alert xóa không hiển thị**
- Khi nhấn nút "Xóa kế hoạch" → Không thấy confirmation dialog
- Alert.alert không hoạt động như mong đợi

## ✅ Giải pháp áp dụng:

### 1. **Custom Toast Config với nhiều dòng hơn**

Tạo custom toast config trong `App.tsx`:

```tsx
const toastConfig = {
  success: (props: any) => (
    <View className="bg-green-500 mx-4 p-4 rounded-2xl shadow-lg" 
          style={{ maxWidth: '90%', minWidth: 300 }}>
      <Text className="text-white font-bold text-base mb-1">
        {props.text1}
      </Text>
      <Text className="text-white text-sm" numberOfLines={5}>
        {props.text2}
      </Text>
    </View>
  ),
  error: (props: any) => (
    <View className="bg-red-500 mx-4 p-4 rounded-2xl shadow-lg" 
          style={{ maxWidth: '90%', minWidth: 300 }}>
      <Text className="text-white font-bold text-base mb-1">
        {props.text1}
      </Text>
      <Text className="text-white text-sm" numberOfLines={5}>
        {props.text2}
      </Text>
    </View>
  ),
  info: (props: any) => (
    <View className="bg-blue-500 mx-4 p-4 rounded-2xl shadow-lg" 
          style={{ maxWidth: '90%', minWidth: 300 }}>
      <Text className="text-white font-bold text-base mb-1">
        {props.text1}
      </Text>
      <Text className="text-white text-sm" numberOfLines={5}>
        {props.text2}
      </Text>
    </View>
  ),
};
```

**Áp dụng config:**
```tsx
<Toast config={toastConfig} />
```

**Key changes:**
- `numberOfLines={5}` - Cho phép hiển thị tối đa 5 dòng (thay vì 2 mặc định)
- `maxWidth: '90%'` - Toast chiếm 90% màn hình
- `minWidth: 300` - Đảm bảo đủ rộng để đọc
- Custom background colors: green (success), red (error), blue (info)

### 2. **Cải thiện Alert.alert**

#### Thêm callbacks và options:

**Before:**
```tsx
Alert.alert(
  "❓ Xác nhận xóa",
  "Bạn có chắc chắn muốn xóa kế hoạch này không?",
  [
    { text: "Hủy", style: "cancel" },
    { text: "Xóa", style: "destructive", onPress: async () => {...} }
  ]
);
```

**After:**
```tsx
Alert.alert(
  "Xác nhận xóa",  // Bỏ emoji ❓ có thể gây conflict
  "Bạn có chắc chắn muốn xóa kế hoạch này không?",
  [
    { 
      text: "Hủy", 
      style: "cancel",
      onPress: () => {
        console.log("User cancelled delete");
      }
    },
    {
      text: "Xóa",
      style: "destructive",
      onPress: async () => {
        console.log("User confirmed delete");
        // ... delete logic ...
        Toast.show({...}); // Show toast after deletion
      }
    }
  ],
  { 
    cancelable: true,  // Cho phép tap outside để đóng
    onDismiss: () => {
      console.log("Alert dismissed");
    }
  }
);
```

**Improvements:**
- Thêm `console.log` để debug
- Thêm option `cancelable: true` - tap outside để đóng
- Thêm `onDismiss` callback
- Bỏ emoji trong title (có thể gây lỗi rendering)
- Explicit onPress cho nút "Hủy"

### 3. **Fix logic trong deletePlan()**

```tsx
const deletePlan = async () => {
  if (!currentPlan) return;

  Alert.alert(
    "Xác nhận xóa",
    "Bạn có chắc chắn muốn xóa kế hoạch này không?",
    [
      { 
        text: "Hủy", 
        style: "cancel",
        onPress: () => {
          console.log("User cancelled delete");
        }
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          console.log("User confirmed delete");
          try {
            await dispatch(deleteMealPlan(currentPlan._id)).unwrap();
            
            // Fix: Tính toán remainingPlans đúng
            const remainingPlans = sortedMealPlans.filter(
              p => p._id !== currentPlan._id
            );
            
            setViewMode(remainingPlans.length > 0 ? "viewing" : "browse");
            setCurrentPlanIndex(0);
            
            // Show success toast
            Toast.show({
              type: "success",
              text1: "✅ Thành công",
              text2: "Đã xóa kế hoạch bữa ăn!",
              position: "top",
              visibilityTime: 3000,
            });
          } catch (err) {
            // Show error toast
            Toast.show({
              type: "error",
              text1: "❌ Lỗi",
              text2: errorMessage,
              position: "top",
              visibilityTime: 4000,
            });
          }
        }
      }
    ],
    { 
      cancelable: true,
      onDismiss: () => {
        console.log("Alert dismissed");
      }
    }
  );
};
```

## 📋 Files Changed:

### 1. **App.tsx**
- ✅ Import `Text` from 'react-native'
- ✅ Thêm `toastConfig` với custom layout
- ✅ Apply config: `<Toast config={toastConfig} />`

### 2. **MealPlanPage.tsx**
- ✅ Update `deletePlan()` với Alert callbacks
- ✅ Update `removeRecipeFromMeal()` với Alert callbacks
- ✅ Thêm console.log để debug
- ✅ Fix logic tính remainingPlans

## 🧪 Testing Steps:

### Test Toast với text dài:
1. Tạo plan mới khi đã có 3 plans → Toast hiển thị:
   ```
   Giới hạn kế hoạch
   Bạn đã có 3 kế hoạch chưa hoàn thành. 
   Vui lòng hoàn thành hoặc xóa bớt trước khi tạo mới.
   ```
   ✅ Toàn bộ text hiển thị (không bị ...)

### Test Alert xóa:
1. Vào một plan pending
2. Nhấn nút "Xóa kế hoạch" (đỏ)
3. ✅ Alert dialog xuất hiện với 2 nút: "Hủy" và "Xóa"
4. Chọn "Xóa" → Toast success xuất hiện
5. Check console log:
   ```
   User confirmed delete
   ```

### Test Alert xóa món:
1. Nhấn icon X trên một món ăn
2. ✅ Alert dialog: "Bạn có chắc muốn xóa 'Tên món' khỏi thực đơn?"
3. Chọn "Xóa" → Món bị xóa + Toast success
4. Check console log:
   ```
   User confirmed remove recipe
   ```

### Test tap outside Alert:
1. Mở Alert xóa
2. Tap vào vùng ngoài dialog
3. ✅ Alert đóng lại
4. Check console log:
   ```
   Alert dismissed
   ```

## 🎨 Visual Comparison:

### Before:
```
Toast Text 2:
"Bạn đã có 3 kế hoạch chưa hoàn..."  ❌ Bị cắt

Alert:
(Không hiển thị hoặc khó thấy)  ❌
```

### After:
```
Toast Text 2:
"Bạn đã có 3 kế hoạch chưa hoàn thành.
Vui lòng hoàn thành hoặc xóa bớt 
trước khi tạo mới."  ✅ Hiển thị đầy đủ

Alert:
╔══════════════════════════╗
║  Xác nhận xóa            ║
║  Bạn có chắc chắn muốn  ║
║  xóa kế hoạch này không? ║
║                          ║
║  [Hủy]      [Xóa]       ║
╚══════════════════════════╝  ✅ Rõ ràng
```

## 💡 Key Takeaways:

1. **numberOfLines={5}** - Quan trọng để hiển thị text dài
2. **maxWidth: '90%'** - Đảm bảo Toast đủ rộng
3. **Alert callbacks** - Giúp debug và kiểm soát flow
4. **cancelable: true** - Better UX, cho phép tap outside
5. **console.log** - Essential cho debugging mobile apps
6. **Bỏ emoji trong Alert title** - Tránh rendering issues

## 🚀 Production Ready

Giờ đây:
- ✅ Toast hiển thị **đầy đủ text** (5 dòng)
- ✅ Alert **hoạt động chính xác** với callbacks
- ✅ Console logs giúp **debug dễ dàng**
- ✅ UX tốt hơn với **cancelable alerts**
- ✅ Visual feedback rõ ràng sau mọi action

Người dùng giờ sẽ thấy thông báo **đầy đủ và rõ ràng** hơn rất nhiều! 🎉
