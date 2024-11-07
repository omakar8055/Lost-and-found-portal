// myListsController.js
const pool = require('../config/db'); // Assuming you're using a DB connection pool

exports.getMyLists = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming req.user contains logged-in user details
        const filter = req.query.filter; // Get the filter from query params

        let lostItems = [];
        let foundItems = [];

        if (filter === 'lost' || !filter) {
            // Fetch lost items along with answers
             [lostItems] = await pool.query(`
              SELECT  li.id, li.item_name, li.description, c.category_name, l.location_name, vq.question, li.lost_date, li.image
              FROM LostItems li
              LEFT JOIN Categories c ON li.category_id = c.id
              LEFT JOIN Locations l ON li.location_id = l.id
              LEFT JOIN VerificationQuestions vq ON li.id = vq.lost_item_id
              WHERE li.user_id = ?
                      
            `, [userId]);

            for (let item of lostItems) {
                console.log(`Checking answers for lost item ID: ${item.id}`);
                const [answers] = await pool.query(`
                    SELECT a.answer, u.name AS answerer_name, u.phone AS answerer_phone
                    FROM QuestionAnswers a
                    JOIN Users u ON a.answerer_user_id = u.id
                    WHERE a.lost_item_id = ?
                `, [item.id]);
                item.answers = answers;  
            }
           
        }

        if (filter === 'found' || !filter) {
            // Fetch found items
             foundItemsResult = await pool.query(`
                SELECT fi.*, c.category_name, l.location_name, u.phone
                FROM FoundItems fi
                LEFT JOIN Categories c ON fi.category_id = c.id
                LEFT JOIN Locations l ON fi.location_id = l.id
                LEFT JOIN Users u ON fi.user_id = u.id
                WHERE fi.user_id = ?
                ORDER BY fi.id DESC
            `, [userId]);

            foundItems = foundItemsResult[0];
        }

        res.render('mylists', { lostItems, foundItems, filter });
    } catch (error) {
        console.error("Error fetching items:", error);
        res.status(500).send("Server error");
    }
};

exports.ClaimLostItem = async (req, res) => {
    const lostItemId = req.params.id;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Step 1: Update status to 'processing' to avoid trigger conflict
        await connection.query('UPDATE LostItems SET status = ? WHERE id = ?', ['processing', lostItemId]);

        // Step 2: Clear related records in QuestionAnswers and VerificationQuestions
        await connection.query('DELETE FROM QuestionAnswers WHERE question_id IN (SELECT id FROM VerificationQuestions WHERE lost_item_id = ?)', [lostItemId]);
        await connection.query('DELETE FROM VerificationQuestions WHERE lost_item_id = ?', [lostItemId]);

        // Step 3: Finally, update status to 'claimed'
        await connection.query('UPDATE LostItems SET status = ? WHERE id = ?', ['claimed', lostItemId]);
        
        await connection.query('DELETE FROM LostItems WHERE id =?', [lostItemId]);

        await connection.commit();
        res.redirect('/mylists');
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting lost item:', error);
        res.status(500).send('Error deleting lost item');
    } finally {
        connection.release();
    }
};



exports.ClaimFoundItem = async (req, res) => {
    const foundItemId = req.params.id;
    const connection = await pool.getConnection();
    try {

        await connection.query('UPDATE LostItems SET status = ? WHERE id = ?', ['processing', foundItemId]);
        // Simply delete the found item
        await connection.query('UPDATE FoundItems SET status = ? WHERE id = ?', ['claimed', foundItemId]);
  
        await connection.query('DELETE FROM FoundItems WHERE id =?', [foundItemId]);

        
        res.redirect('/mylists');
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting found item:', error);
        res.status(500).send('Error deleting found item');
    }finally {
        connection.release();
    }
};

exports.DeleteLostItem = async (req, res) => {
    const lostItemId = req.params.id;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        // Step 1: Clear related records in QuestionAnswers and VerificationQuestions
        await connection.query('DELETE FROM QuestionAnswers WHERE question_id IN (SELECT id FROM VerificationQuestions WHERE lost_item_id = ?)', [lostItemId]);
        await connection.query('DELETE FROM VerificationQuestions WHERE lost_item_id = ?', [lostItemId]);
        // Step2: Clear lostitem  record using lostitem  id
        await connection.query('DELETE FROM LostItems WHERE id =?', [lostItemId]);

        await connection.commit();
        res.redirect('/mylists');
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting lost item:', error);
        res.status(500).send('Error deleting lost item');
    } finally {
        connection.release();
    }
};


exports.DeleteFoundItem = async (req, res) => {
    const foundItemId = req.params.id;
    const connection = await pool.getConnection();
    try {
        await connection.query('DELETE FROM FoundItems WHERE id =?', [foundItemId]);        
        res.redirect('/mylists');
    } catch (error) {
        await connection.rollback();
        console.error('Error deleting found item:', error);
        res.status(500).send('Error deleting found item');
    }finally {
        connection.release();
    }
};
