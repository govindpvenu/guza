const brands = await Product.aggregate([
  {
    $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] }
  },
  {
    $group: {
      _id: "$brand",
      products: { $push: "$$ROOT" },
      firstImage: { $first: { $arrayElemAt: ["$images", 0] } },
      productCount: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      brand: "$_id",
      firstImage: 1,
      productCount: 1

    }
  }
])
4
4.5
5
5.5
6
6.5
7
7.5
8
8.5
9
9.5
10
10.5
11
11.5
12
// 088178 bg color







// <!-- <div class="mb-4 row align-items-center">
// <label
//     class="col-sm-3 col-form-label form-label-title">Images</label>
// <div class="col-sm-9">
//     <div class="col-sm-9">
//         <!-- Display existing images -->
//         <% for (let i = 0; i < product.images.length; i++) { %>
//             <div>
//                 <img src="/images/<%= product.images[i] %>" alt="Product Image">
//                 <button type="button" class="btn btn-danger btn-sm remove-image" data-index="<%= i %>">Remove</button>
//             </div>
//         <% } %>

//         <!-- Input for adding new images -->
//         <input name="new_images" type="file" multiple>
//     </div>
// </div>

    

//     <!-- <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
//     <div class="field">
//         <h3>Upload or Edit Images</h3>
//         <input type="file" id="files" name="image" multiple />
//         <div id="existing-images">
    
//           <% for (let i = 0; i < product.images.length; i++) { %>
//             <div class="pip">
//               <img class="imageThumb" src="/images/<%= product.images[i] %>" />
//               <br />
//               <span class="remove">Remove image</span>
//             </div>
//             <% } %>
//         </div>
//       </div> -->
      
// </div>
// </div>
const brandsss = await Product.aggregate([
  {
    $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] }
  },
  {
    $group: {
      _id: "$brand",
      products: { $push: "$$ROOT" },
      productCount: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      brand: "$_id",
      productCount: 1

    }
  }
])
const product_type = await Product.aggregate([
  {
    $match: { $and: [{ is_Listed: true }, { "category.is_Listed": true }] }
  },
  {
    $group: {
      _id: "$brand",
      products: { $push: "$$ROOT" },
      productCount: { $sum: 1 }
    }
  },
  {
    $project: {
      _id: 0,
      brand: "$_id",
      productCount: 1

    }
  }
])