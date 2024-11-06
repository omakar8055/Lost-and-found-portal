const db = require('../config/db');



exports.getFilteredLostItems = async (req, res) => {
    console.log("getFilteredLostItems called")
    const { filter } = req.query;

    try {
        const [lostItems] = await db.query(
            `SELECT 
                LostItems.id, LostItems.item_name, LostItems.description, LostItems.image, LostItems.lost_date, 
                Categories.category_name, Locations.location_name, VerificationQuestions.question,VerificationQuestions.id as verificationid
            FROM LostItems 
            JOIN Categories ON LostItems.category_id = Categories.id 
            JOIN Locations ON LostItems.location_id = Locations.id  
            LEFT JOIN VerificationQuestions ON VerificationQuestions.lost_item_id = LostItems.id 
            WHERE Categories.category_name = ?`,
            [filter]
        );

        res.render('lostcontent', { lostItems });
    } catch (error) {
        console.error("Error fetching filtered lost items:", error);
        res.status(500).send("Error fetching filtered lost items.");
    }
};

