const db = require('../config/db'); // Make sure the path is correct
const multer = require('multer');

// Configure multer to store images in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Handler function to save form data
exports.postItem = async (req, res) => {
    console.log(req.body)
    const {item_status, category_name, item_name, lost_date, location_name, description,question} = req.body;
    const image = req.file ? req.file.buffer.toString('base64') : null;
    const user_id = req.user ? req.user.id : null; // Assuming `req.user` has the authenticated user’s ID

    try {
        // Check if essential fields are provided
        if (!item_status || !item_name || !description || !category_name || !location_name) {
            throw new Error("Missing required fields: item_status, item_name, description, category_name, or location_name.");
        }

        // Insert or find the category
        let [category] = await db.query("SELECT id FROM Categories WHERE category_name = ?", [category_name]);
        if (category.length === 0) {
            const [result] = await db.query("INSERT INTO Categories (category_name) VALUES (?)", [category_name]);
            category = [{ id: result.insertId }];
        }
        const category_id = category[0]?.id;

        if (!category_id) {
            throw new Error("Failed to retrieve or create category ID.");
        }

        // Insert or find the location
        let [location] = await db.query("SELECT id FROM Locations WHERE location_name = ?", [location_name]);
        if (location.length === 0) {
            const [result] = await db.query("INSERT INTO Locations (location_name) VALUES (?)", [location_name]);
            location = [{ id: result.insertId }];
        }
        const location_id = location[0]?.id;

        if (!location_id) {
            throw new Error("Failed to retrieve or create location ID.");
        }
        
       
        // Choose the correct table and date field based on item_status
        const table = item_status === 'lost' ? 'LostItems' : 'FoundItems';
        const dateField = item_status === 'lost' ? 'lost_date' : 'found_date';
        if(item_status==='lost'&& !question){
                throw new Error("Missing required fields:question");
        }
        // Insert data into LostItems or FoundItems table
        const [result] = await db.query(
            `INSERT INTO ${table} (user_id, item_name, description, category_id, location_id, ${dateField}, image, item_status, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, item_name, description, category_id, location_id, lost_date, image, item_status, 'pending']
        );
        lost_item=[{ id: result.insertId }];
        console.log(result)

        const lost_item_id=lost_item[0]?.id;
        if (!lost_item_id) {
            throw new Error("Failed to retrieve or create lostItem ID.");
        }
        if(item_status==='lost'){
          
            const [result] = await db.query("INSERT INTO verificationquestions (lost_item_id,question) VALUES (?,?)", [lost_item_id,question]);
            questions = [{ id: result.insertId }];
            const question_id = questions[0]?.id;

        if (!question_id) {
            throw new Error("Failed to retrieve or create question ID.");
        }
        }

        res.redirect('/home');
    } catch (error) {
        console.error("Error in postItem controller:", error);
        res.status(500).send(`Error posting item: ${error.message}`);
    }
};

// Export the multer configuration for route usage
exports.upload = upload;
