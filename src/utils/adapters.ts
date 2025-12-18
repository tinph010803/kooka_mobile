// utils/adapters.ts
import type { Recipe } from "../redux/slices/recipeSlice";

/**
 * Xác định đơn vị mặc định cho nguyên liệu dựa trên tên
 * @param ingredient - Tên nguyên liệu
 * @returns Đơn vị đo lường phù hợp
 */
export const getDefaultUnit = (ingredient: string): string => {
    const lowerIngredient = ingredient.toLowerCase();
    
    // === GIA VỊ CỦ & LÁ ===
    if (lowerIngredient.includes('tỏi')) return 'tép';
    if (lowerIngredient.includes('riềng') || lowerIngredient.includes('gừng') || lowerIngredient.includes('nghệ')) return 'miếng';
    if (lowerIngredient.includes('sả')) return 'cây';
    if (lowerIngredient.includes('ớt')) return 'trái';
    if (lowerIngredient.includes('hành khô') || lowerIngredient.includes('tỏi khô')) return 'muỗng canh';
    
    // === BẮP CẢI - CÁI ===
    if (lowerIngredient.includes('bắp cải') || lowerIngredient.includes('cải bắp')) {
        return 'cái';
    }
    
    // === RAU LÁ - BÓ/NẮM ===
    if (lowerIngredient.includes('rau muống') || 
        lowerIngredient.includes('cải thìa') ||
        lowerIngredient.includes('cải xanh') ||
        lowerIngredient.includes('cải ngồng') ||
        lowerIngredient.includes('rau húng') ||
        lowerIngredient.includes('rau mùi tàu') ||
        lowerIngredient.includes('ngò gai') ||
        lowerIngredient.includes('tía tô') ||
        lowerIngredient.includes('húng lủi')) {
        return 'bó';
    }
    
    if (lowerIngredient.includes('ngò') || 
        lowerIngredient.includes('rau mùi') ||
        lowerIngredient.includes('rau răm') ||
        lowerIngredient.includes('giá đỗ') ||
        lowerIngredient.includes('hẹ') ||
        lowerIngredient.includes('rau càng cua') ||
        lowerIngredient.includes('mồng tơi') ||
        lowerIngredient.includes('rau dền') ||
        lowerIngredient.includes('rau ngót') ||
        lowerIngredient.includes('rau cần') ||
        lowerIngredient.includes('rau bó xôi') ||
        lowerIngredient.includes('xà lách') ||
        lowerIngredient.includes('rau thơm') ||
        lowerIngredient.includes('rau má')) {
        return 'nắm';
    }
    
    if (lowerIngredient.includes('hành lá') || lowerIngredient.includes('hành hoa')) return 'nhánh';
    
    if (lowerIngredient.includes('lá chanh') || 
        lowerIngredient.includes('lá chúc') ||
        lowerIngredient.includes('lá nguyệt quế') ||
        lowerIngredient.includes('lá chuối') ||
        lowerIngredient.includes('lá dứa') ||
        lowerIngredient.includes('lá é') ||
        lowerIngredient.includes('lá cây')) {
        return 'lá';
    }
    
    // === RAU CỦ - CỦ ===
    if (lowerIngredient.includes('cà rốt') || 
        lowerIngredient.includes('khoai') ||
        lowerIngredient.includes('hành tây') ||
        lowerIngredient.includes('hành tím') ||
        lowerIngredient.includes('hành ta') ||
        lowerIngredient.includes('củ cải') ||
        lowerIngredient.includes('su hào') ||
        lowerIngredient.includes('su su') ||
        lowerIngredient.includes('củ sen') ||
        lowerIngredient.includes('xu hào') ||
        lowerIngredient.includes('củ sắn') ||
        lowerIngredient.includes('củ đậu')) {
        return 'củ';
    }
    
    // === RAU QUẢ - QUẢ ===
    if (lowerIngredient.includes('cà chua') || 
        lowerIngredient.includes('dưa leo') ||
        lowerIngredient.includes('dưa chuột') ||
        lowerIngredient.includes('bí đỏ') ||
        lowerIngredient.includes('bí ngô') ||
        lowerIngredient.includes('bí xanh') ||
        lowerIngredient.includes('cà tím') ||
        lowerIngredient.includes('bầu') ||
        lowerIngredient.includes('mướp') ||
        lowerIngredient.includes('khổ qua') ||
        lowerIngredient.includes('me') ||
        lowerIngredient.includes('súp lơ') ||
        lowerIngredient.includes('bắp mỹ') ||
        lowerIngredient.includes('ớt chuông') ||
        lowerIngredient.includes('dưa môn') ||
        lowerIngredient.includes('chanh') ||
        lowerIngredient.includes('cam')) {
        return 'quả';
    }
    
    // === GIA VỊ LỎNG - MUỖNG CANH (phải kiểm tra TRƯỚC nước chung) ===
    if (lowerIngredient.includes('nước mắm') || 
        lowerIngredient.includes('nước tương') ||
        lowerIngredient.includes('dầu hào') ||
        lowerIngredient.includes('tương ớt') ||
        lowerIngredient.includes('tương cà') ||
        lowerIngredient.includes('dầu ăn') ||
        lowerIngredient.includes('dầu olive') ||
        lowerIngredient.includes('dầu oliu') ||
        lowerIngredient.includes('dầu mè') ||
        lowerIngredient.includes('dầu điều') ||
        lowerIngredient.includes('dầu') ||
        lowerIngredient.includes('giấm') ||
        lowerIngredient.includes('dấm') ||
        lowerIngredient.includes('mắm tôm') ||
        lowerIngredient.includes('mắm ruốc') ||
        lowerIngredient.includes('mắm nêm') ||
        lowerIngredient.includes('sa tế') ||
        lowerIngredient.includes('xì dầu') ||
        lowerIngredient.includes('bơ mè') ||
        lowerIngredient.includes('mật ong')) {
        return 'muỗng canh';
    }
    
    // === CHẤT LỎNG - ML ===
    if (lowerIngredient.includes('nước cốt dừa') || 
        lowerIngredient.includes('nước dừa') ||
        lowerIngredient.includes('nước cốt chanh') ||
        lowerIngredient.includes('nước lọc') ||
        lowerIngredient.includes('nước nóng') ||
        lowerIngredient.includes('nước mía') ||
        lowerIngredient.includes('rượu trắng') ||
        lowerIngredient.includes('rượu') ||
        lowerIngredient.includes('nước') ||
        lowerIngredient.includes('sữa đặc') ||
        lowerIngredient.includes('sữa')) {
        return 'ml';
    }
    
    // === GIA VỊ KHÔ - MUỖNG CÀ PHÊ ===
    if (lowerIngredient.includes('muối') || 
        lowerIngredient.includes('tiêu')) {
        return 'muỗng cà phê';
    }
    
    // === GIA VỊ KHÔ KHÁC - MUỖNG CANH ===
    if (lowerIngredient.includes('đường') ||
        lowerIngredient.includes('bột ngọt') ||
        lowerIngredient.includes('hạt nêm chay') ||
        lowerIngredient.includes('hạt nêm') ||
        lowerIngredient.includes('bột nghệ') ||
        lowerIngredient.includes('bột canh') ||
        lowerIngredient.includes('bột thì là') ||
        lowerIngredient.includes('ngũ vị hương') ||
        lowerIngredient.includes('bột cà ri')) {
        return 'muỗng canh';
    }
    
    // === BỘT - GRAM ===
    if (lowerIngredient.includes('bột mì') ||
        lowerIngredient.includes('bột năng') ||
        lowerIngredient.includes('bột gạo') ||
        lowerIngredient.includes('bột chiên xù') ||
        lowerIngredient.includes('bột bắp') ||
        lowerIngredient.includes('bột nếp') ||
        lowerIngredient.includes('bột đậu xanh') ||
        lowerIngredient.includes('bột rau câu') ||
        lowerIngredient.includes('bột')) {
        return 'gram';
    }
    
    // === TRỨNG ===
    if (lowerIngredient.includes('trứng') || 
        lowerIngredient.includes('hột vịt lộn')) return 'quả';
    
    // === ĐẬU PHỤ - MIẾNG ===
    if (lowerIngredient.includes('đậu phụ') || 
        lowerIngredient.includes('đậu hũ')) {
        return 'miếng';
    }
    
    // === NẤM - GRAM ===
    if (lowerIngredient.includes('nấm đùi gà') ||
        lowerIngredient.includes('nấm rơm') ||
        lowerIngredient.includes('nấm cây') ||
        lowerIngredient.includes('nấm hương') ||
        lowerIngredient.includes('nấm mèo') ||
        lowerIngredient.includes('nấm đông cô') ||
        lowerIngredient.includes('nấm linh chi') ||
        lowerIngredient.includes('nấm bào ngư') ||
        lowerIngredient.includes('nấm bạch tuyết') ||
        lowerIngredient.includes('mộc nhĩ') ||
        lowerIngredient.includes('nấm')) {
        return 'gram';
    }
    
    // === HẠT & HẠT KHÔ - GRAM ===
    if (lowerIngredient.includes('hạt sen') ||
        lowerIngredient.includes('hạt điều') ||
        lowerIngredient.includes('hạt dẻ') ||
        lowerIngredient.includes('hạt óc chó') ||
        lowerIngredient.includes('hạt hạnh nhân') ||
        lowerIngredient.includes('lạc') ||
        lowerIngredient.includes('đậu phộng')) {
        return 'gram';
    }
    
    // === ĐẬU RAU - GRAM ===
    if (lowerIngredient.includes('đậu que') ||
        lowerIngredient.includes('đậu bắp')) {
        return 'gram';
    }
    
    // === THỊT GÀ - PHẦN ===
    if (lowerIngredient.includes('đùi gà') ||
        lowerIngredient.includes('cánh gà') ||
        lowerIngredient.includes('chân gà')) {
        return 'cái';
    }
    
    // === CHÂN GIÒ HEO ===
    if (lowerIngredient.includes('chân giò')) {
        return 'cái';
    }
    
    // === THỊT - GRAM ===
    if (lowerIngredient.includes('thịt bò') ||
        lowerIngredient.includes('thịt heo') ||
        lowerIngredient.includes('thịt lợn') ||
        lowerIngredient.includes('thịt gà') ||
        lowerIngredient.includes('thịt vịt') ||
        lowerIngredient.includes('thịt cừu') ||
        lowerIngredient.includes('thịt nai') ||
        lowerIngredient.includes('thịt ba chỉ') ||
        lowerIngredient.includes('thịt nạc') ||
        lowerIngredient.includes('thịt xay') ||
        lowerIngredient.includes('thịt sườn') ||
        lowerIngredient.includes('thịt nguội') ||
        lowerIngredient.includes('thịt lạp') ||
        lowerIngredient.includes('nạm bò') ||
        lowerIngredient.includes('gân bò') ||
        lowerIngredient.includes('thăn bò') ||
        lowerIngredient.includes('ức gà') ||
        lowerIngredient.includes('heo quay') ||
        lowerIngredient.includes('gan') ||
        lowerIngredient.includes('huyết') ||
        lowerIngredient.includes('dạ dày') ||
        lowerIngredient.includes('lưỡi heo') ||
        lowerIngredient.includes('tai heo') ||
        lowerIngredient.includes('phèo non') ||
        lowerIngredient.includes('bao tử heo') ||
        lowerIngredient.includes('lòng heo') ||
        lowerIngredient.includes('dồi trường') ||
        lowerIngredient.includes('tiết lợn') ||
        lowerIngredient.includes('cuống họng lợn') ||
        lowerIngredient.includes('mỏ heo') ||
        lowerIngredient.includes('xương ống') ||
        lowerIngredient.includes('thịt')) {
        return 'gram';
    }
    
    // === THỰC PHẨM CHẾ BIẾN ===
    if (lowerIngredient.includes('xúc xích') ||
        lowerIngredient.includes('lạp xưởng') ||
        lowerIngredient.includes('nem chua')) {
        return 'cái';
    }
    
    if (lowerIngredient.includes('giò') ||
        lowerIngredient.includes('chả lụa')) {
        return 'thanh';
    }
    
    // === HẢI SẢN ===
    // Cá - con (vì thường đếm được)
    if (lowerIngredient.includes('cá lóc') || 
        lowerIngredient.includes('cá hồi') ||
        lowerIngredient.includes('cá ngừ') ||
        lowerIngredient.includes('cá nục') ||
        lowerIngredient.includes('cá chạch') ||
        lowerIngredient.includes('cá lăng') ||
        lowerIngredient.includes('cá basa') ||
        lowerIngredient.includes('cá rô phi') ||
        lowerIngredient.includes('cá diêu hồng') ||
        lowerIngredient.includes('cá')) {
        return 'con';
    }
    
    // Tôm/mực - gram (chuẩn hơn vì có nhiều size khác nhau)
    if (lowerIngredient.includes('tôm khô')) {
        return 'muỗng canh';
    }
    
    if (lowerIngredient.includes('tôm càng') ||
        lowerIngredient.includes('tôm') ||
        lowerIngredient.includes('mực') ||
        lowerIngredient.includes('bạch tuộc')) {
        return 'gram';
    }
    
    // Động vật có vỏ - con (thường lớn và đếm được)
    if (lowerIngredient.includes('cua') ||
        lowerIngredient.includes('càng ghẹ') ||
        lowerIngredient.includes('hàu') ||
        lowerIngredient.includes('sò điệp') ||
        lowerIngredient.includes('sò') ||
        lowerIngredient.includes('nghêu') ||
        lowerIngredient.includes('ốc hương') ||
        lowerIngredient.includes('ốc bươu') ||
        lowerIngredient.includes('ốc')) {
        return 'con';
    }
    
    // === BÁNH ===
    if (lowerIngredient.includes('bánh mì') || lowerIngredient.includes('ổ bánh')) return 'ổ';
    
    // Bún/bánh phở - phân biệt khô/tươi
    if (lowerIngredient.includes('bún khô') || 
        lowerIngredient.includes('bánh phở khô')) {
        return 'gói';
    }
    
    if (lowerIngredient.includes('bún tươi') || 
        lowerIngredient.includes('bánh phở tươi')) {
        return 'gram';
    }
    
    // Mặc định cho bún/bánh phở không chỉ rõ
    if (lowerIngredient.includes('bánh phở') || 
        lowerIngredient.includes('bánh tráng') ||
        lowerIngredient.includes('mì trứng') ||
        lowerIngredient.includes('mì quảng') ||
        lowerIngredient.includes('mì căn') ||
        lowerIngredient.includes('hủ tiếu') ||
        lowerIngredient.includes('miến dong') ||
        lowerIngredient.includes('bún')) {
        return 'gói';
    }
    
    // === CHẢ ===
    if (lowerIngredient.includes('chả cá')) return 'miếng';
    if (lowerIngredient.includes('chả')) return 'thanh';
    
    // === NGŨ CỐC - GRAM ===
    if (lowerIngredient.includes('gạo') ||
        lowerIngredient.includes('gạo nếp') ||
        lowerIngredient.includes('gạo tẻ') ||
        lowerIngredient.includes('đậu xanh') ||
        lowerIngredient.includes('đậu đỏ') ||
        lowerIngredient.includes('đậu đen') ||
        lowerIngredient.includes('đậu trắng') ||
        lowerIngredient.includes('đậu gà') ||
        lowerIngredient.includes('đậu') ||
        lowerIngredient.includes('mè') ||
        lowerIngredient.includes('vừng') ||
        lowerIngredient.includes('yến mạch') ||
        lowerIngredient.includes('hạt chia') ||
        lowerIngredient.includes('hạt quinoa') ||
        lowerIngredient.includes('hạt tiêu') ||
        lowerIngredient.includes('cốm') ||
        lowerIngredient.includes('ngô') ||
        lowerIngredient.includes('kê')) {
        return 'gram';
    }
    
    // === PHÔ MAI, BƠ, KEM ===
    if (lowerIngredient.includes('phô mai') ||
        lowerIngredient.includes('cream cheese') ||
        lowerIngredient.includes('whipping cream') ||
        lowerIngredient.includes('kem sữa tươi') ||
        lowerIngredient.includes('kem topping') ||
        lowerIngredient.includes('bơ')) {
        return 'gram';
    }
    
    // === NGUYÊN LIỆU ĐẶC BIỆT ===
    if (lowerIngredient.includes('thạch dừa') ||
        lowerIngredient.includes('trà xanh khô') ||
        lowerIngredient.includes('socola đen') ||
        lowerIngredient.includes('hoa đậu biếc') ||
        lowerIngredient.includes('men rượu')) {
        return 'gram';
    }
    
    // === BÁNH KẸO ===
    if (lowerIngredient.includes('bánh oreo') ||
        lowerIngredient.includes('bánh quy') ||
        lowerIngredient.includes('cốm màu')) {
        return 'gói';
    }
    
    // === SIRO ===
    if (lowerIngredient.includes('siro')) {
        return 'muỗng canh';
    }
    
    // === ĐÁ ===
    if (lowerIngredient.includes('đá')) {
        return 'viên';
    }
    
    // === TRÁI CÂY ===
    if (lowerIngredient.includes('thơm') ||
        lowerIngredient.includes('dứa') ||
        lowerIngredient.includes('táo') ||
        lowerIngredient.includes('chuối') ||
        lowerIngredient.includes('quả bơ') ||
        lowerIngredient.includes('nho') ||
        lowerIngredient.includes('xoài') ||
        lowerIngredient.includes('lê') ||
        lowerIngredient.includes('dưa hấu') ||
        lowerIngredient.includes('dưa lưới') ||
        lowerIngredient.includes('dâu tây') ||
        lowerIngredient.includes('mít') ||
        lowerIngredient.includes('sầu riêng') ||
        lowerIngredient.includes('khế') ||
        lowerIngredient.includes('đu đủ') ||
        lowerIngredient.includes('dừa sáp') ||
        lowerIngredient.includes('dừa sấy') ||
        lowerIngredient.includes('dừa')) {
        return 'quả';
    }
    
    // === NGUYÊN LIỆU ĐẶC BIỆT KHÁC ===
    if (lowerIngredient.includes('quả gấc') ||
        lowerIngredient.includes('tre') ||
        lowerIngredient.includes('mía lau') ||
        lowerIngredient.includes('xá bấu') ||
        lowerIngredient.includes('cơm') ||
        lowerIngredient.includes('đậu hũ chiên') ||
        lowerIngredient.includes('sườn non chay') ||
        lowerIngredient.includes('chả chay') ||
        lowerIngredient.includes('mắm cá') ||
        lowerIngredient.includes('cà la thầu') ||
        lowerIngredient.includes('giờ sống')) {
        return 'miếng';
    }
    
    // Mặc định - gram
    return 'gram';
};

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
