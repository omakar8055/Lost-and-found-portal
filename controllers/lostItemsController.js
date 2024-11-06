// controllers/lostItemsController.js
const db = require('../config/db');

exports.getFilteredLostItems = async (req, res) => {
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

        res.render('lost-items', { lostItems });
    } catch (error) {
        console.error("Error fetching filtered lost items:", error);
        res.status(500).send("Error fetching filtered lost items.");
    }
};

exports.getFilteredfoundItems = async (req, res) => {
    const { filter } = req.query;
    console.log(filter)
    try {
        const [founditems] = await db.query(`
            SELECT 
                FoundItems.item_name, 
                FoundItems.description, 
                FoundItems.found_date,
                FoundItems.image,
                Categories.category_name,
                Locations.location_name,
                Users.phone
            FROM FoundItems 
            JOIN Categories ON FoundItems.category_id = Categories.id 
            JOIN Locations ON FoundItems.location_id = Locations.id 
            JOIN Users ON FoundItems.user_id = Users.id 
            WHERE Categories.category_name = ?`,
         [filter]);

        res.render('found-items', { founditems });
    } catch (error) {
        console.error("Error fetching filtered lost items:", error);
        res.status(500).send("Error fetching filtered lost items.");
    }
};

// In answerController.js
exports.submitAnswer = async (req, res) => {
    const { question_id, lost_item_id, answer, answer_user_id } = req.body;
    try {
        await db.query(`
            INSERT INTO QuestionAnswers (question_id, lost_item_id, answerer_user_id, answer)
            VALUES (?, ?, ?, ?)
        `, [question_id, lost_item_id, answer_user_id, answer]);

        res.sendStatus(200); 
    } catch (error) {
        console.error("Error submitting answer:", error);
        res.status(500).send("An error occurred while submitting your answer.");
    }
};

