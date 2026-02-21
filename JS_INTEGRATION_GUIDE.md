# 📚 JavaScript Files Integration Guide

இந்த document-ல எந்த HTML page-க்கு எந்த JavaScript files add பண்ணணும்-னு தெளிவா சொல்லியிருக்கேன்.

## 🎯 வழிமுறை (Instructions)

ஒவ்வொரு HTML page-ஓட `</body>` tag-க்கு முன்னாடி கீழே கொடுத்திருக்கற JavaScript files-ஐ இந்த order-ல add பண்ணுங்க:

---

## 📄 Page-wise JavaScript Files

### 1. **index.html** (Home Page) ✅ DONE
```html
<!-- JavaScript Files (Load order matters!) -->
<script src="./js/config.js"></script>
<script src="./js/utils.js"></script>
<script src="./js/api.js"></script>
<script src="./js/auth.js"></script>
<script src="./js/common.js"></script>
<script src="./js/index.js"></script>
```

---

### 2. **pages/login.html** (Login Page)
```html
<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/login.js"></script>
```

---

### 3. **pages/sign up.html** (Signup Page)
```html
<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/signup.js"></script>
```

---

### 4. **pages/products_page.html** (Products Listing Page)
```html
<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/common.js"></script>
<script src="../js/products.js"></script>
```

---

### 5. **pages/product.html** (Product Detail Page)
```html
<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/common.js"></script>
<script src="../js/product.js"></script>
```

---

### 6. **pages/cart.html** (Shopping Cart Page)
```html
<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/common.js"></script>
<script src="../js/cart.js"></script>
```

---

### 7. **pages/seller_dashboard.html** (Seller Dashboard)
```html
<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/common.js"></script>
<script src="../js/seller_dashboard.js"></script>
```

---

### 8. **pages/user_details.html** (User Profile Page)
```html
<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/common.js"></script>
<script src="../js/user_profile.js"></script>
```

---

### 9. **pages/feedback.html** (Feedback Page)
```html
<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/common.js"></script>
<script src="../js/feedback.js"></script>
```

---

### 10. **மற்ற எல்லா pages-க்கும்** (Other Pages)

பாக்கி pages-க்கு (categories, best_selling, about, etc.) basic functionality-க்கு இத add பண்ணுங்க:

```html
<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/common.js"></script>
```

---

## 🔧 Load Order முக்கியம் (Load Order is Important!)

JavaScript files-ஐ **கீழ்கண்ட order-ல** தான் load பண்ணணும்:

1. **config.js** - Settings and API URLs (முதல்ல load ஆகணும்)
2. **utils.js** - Helper functions (Modal, formatting, etc.)
3. **api.js** - Backend communication (utils-க்கு பின்னாடி)
4. **auth.js** - Authentication (api-க்கு பின்னாடி)
5. **common.js** - Common UI updates (optional, auth-க்கு பின்னாடி)
6. **[page-specific].js** - Page specific code (கடைசியா load ஆகணும்)

---

## 📝 Examples படங்கோடு புரிஞ்சுக்கலாம்:

### Example 1: Login Page

கீழே `</body>` tag இருக்கும் இடம் கண்டுபிடித்து, அதுக்கு மேல add பண்ணுங்க:

```html
</section>

<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/login.js"></script>

</body>
</html>
```

### Example 2: Product Page

```html
</footer>

<!-- JavaScript Files -->
<script src="../js/config.js"></script>
<script src="../js/utils.js"></script>
<script src="../js/api.js"></script>
<script src="../js/auth.js"></script>
<script src="../js/common.js"></script>
<script src="../js/product.js"></script>

</body>
</html>
```

---

## 🎨 மாதிரி Template (Generic Template)

எந்த page-க்கும் இந்த basic template use பண்ணலாம்:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Your head content -->
</head>
<body>
    <!-- Your page content -->

    <!-- JavaScript Files (Add before </body>) -->
    <script src="../js/config.js"></script>
    <script src="../js/utils.js"></script>
    <script src="../js/api.js"></script>
    <script src="../js/auth.js"></script>
    <script src="../js/common.js"></script>
    <!-- Add page-specific JS here if needed -->

</body>
</html>
```

---

## ⚠️ முக்கிய குறிப்புகள் (Important Notes)

1. **Path சரியா இருக்கா check பண்ணுங்க:**
   - Main folder-ல இருக்கற files-க்கு: `./js/filename.js`
   - Pages folder-ல இருக்கற files-க்கு: `../js/filename.js`

2. **Browser Console-ல error இல்லாம check பண்ணுங்க:**
   - F12 press பண்ணி Developer Tools open பண்ணுங்க
   - Console tab-ல green tick marks (✅) காணணும்
   - Red errors (❌) இருந்தா path தப்பா இருக்கு

3. **Backend URL சரியா config பண்ணுங்க:**
   - `js/config.js` file-ல `API_BASE_URL` change பண்ணுங்க
   - Local: `http://localhost:8000`
   - Production: உங்க deployed URL

---

## 🚀 Testing முறை (How to Test)

1. **Browser-ல page open பண்ணுங்க:**
   ```
   Right-click index.html → Open with → Chrome/Edge
   ```

2. **F12 press பண்ணி Console பாருங்க:**
   - You should see: ✅ Config.js loaded successfully!
   - You should see: ✅ Utils.js loaded successfully!
   - You should see: ✅ API.js loaded successfully!
   - etc.

3. **Functionality test பண்ணுங்க:**
   - Login form submit பண்ணி பாருங்க
   - Product-ஐ click பண்ணி பாருங்க
   - Add to cart button work ஆகுதா பாருங்க

---

## 🎯 Next Steps

1. ✅ JavaScript files எல்லாம் create ஆகிடுச்சு
2. ⏳ HTML pages-ல JS files-ஐ add பண்ணுங்க (இந்த guide படி)
3. ⏳ Backend server run பண்ணுங்க (`python -m uvicorn main:app --reload`)
4. ⏳ Frontend-ஐ browser-ல open பண்ணி test பண்ணுங்க

---

## 💡 Tips

- எந்த page-லயும் Alert காட்டலை, எல்லாம் beautiful popup-ல காட்டும்! ✨
- Error messages red-ல, success green-ல, warning orange-ல! 🎨
- Loading spinner automatic-ஆ காட்டும்! ⏳
- உங்க பெயர் header-ல automatic-ஆ update ஆகும்! 👤

---

**Created by Antigravity AI Assistant** 🤖
**For: UZHAVAN PLANET E-commerce Platform** 🌱
