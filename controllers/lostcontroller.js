const db = require('../config/db');



exports.LostItems = async (req, res) => {
    
    try {
        const [lostItems] = await db.query(
            `SELECT 
              LostItems.id, 
             LostItems.item_name, 
              LostItems.description, 
             LostItems.lost_date, 
               LostItems.status,
             Locations.location_name
            FROM LostItems
            JOIN Locations ON LostItems.location_id = Locations.id;`
            
        );

        res.render('lostcontent', { lostItems });
    } catch (error) {
        console.error("Error fetching filtered lost items:", error);
        res.status(500).send("Error fetching filtered lost items.");
    }
};

exports.foundItems = async (req, res) => {
    try {
        const [founditems] = await db.query(`
            SELECT 
                Founditems.id,
                Founditems.item_name, 
                Founditems.description, 
                Founditems.found_date,
                Locations.location_name,
                Founditems.status,
                Users.phone  -- Fetch the phone number from Users table
            FROM Founditems  
            JOIN Locations ON Founditems.location_id = Locations.id
            JOIN Users ON Founditems.user_id = Users.id  -- Join with Users to get the phone
        `);

        res.render('founditems', { founditems });
    } catch (error) {
        console.error("Error fetching filtered found items:", error);
        res.status(500).send("Error fetching filtered found items.");
    }
};



exports.getItemStatistics = async (req, res) => {
    try {
        // Call the stored procedure
        await db.query("CALL GetItemStatistics(@totalItems, @lostItems, @lostPercentage, @foundItems, @foundPercentage, @claimedItems, @claimedPercentage);");

        // Fetch the output values
        const [[result]] = await db.query(`
            SELECT 
                @totalItems AS totalItems, 
                @lostItems AS lostItems, 
                @lostPercentage AS lostPercentage, 
                @foundItems AS foundItems, 
                @foundPercentage AS foundPercentage, 
                @claimedItems AS claimedItems, 
                @claimedPercentage AS claimedPercentage;
        `);

        // Convert percentages to numbers and set default to 0 if they are null
        const totalItems = result.totalItems || 0;
        const lostItems = result.lostItems || 0;
        const foundItems = result.foundItems || 0;
        const claimedItems = result.claimedItems || 0;
        const lostPercentage = parseFloat(result.lostPercentage) || 0;
        const foundPercentage = parseFloat(result.foundPercentage) || 0;
        const claimedPercentage = parseFloat(result.claimedPercentage) || 0;

        // Render the 'hello' view with the data
        res.render('hello', { 
            totalItems, 
            lostItems, 
            lostPercentage, 
            foundItems, 
            foundPercentage, 
            claimedItems, 
            claimedPercentage 
        });
    } catch (error) {
        console.error("Error fetching item statistics:", error);
        res.status(500).send("Error fetching item statistics.");
    }
};









exports.delete = async (req, res) => {
    const lostItemId = req.params.id;

    try {
        await db.query('DELETE FROM LostItems WHERE id = ?', [lostItemId]);
        console.log(`Deleted item with id: ${lostItemId}`);
        
        // Redirect or send a response confirming deletion
        res.redirect('/lostitems');  // Redirect back to lost items list
    } catch (error) {
        console.error('Error deleting lost item:', error);
        res.status(500).send('Error deleting lost item');
    }
};

exports.deleteFound = async (req, res) => {
    const foundItemId = req.params.id;

    try {
        await db.query('DELETE FROM FoundItems WHERE id = ?', [foundItemId]);
        res.redirect('/founditems');  // Redirect to the found items list after deletion
    } catch (error) {
        console.error('Error deleting found item:', error);
        res.status(500).send('Error deleting found item');
    }
};


exports.deleteClaimedItem = async (req, res) => {
    const claimedItemId = req.params.id;

    try {
        await db.query('DELETE FROM ClaimedItems WHERE id = ?', [claimedItemId]);
        res.redirect('/claimed-items');  // Redirect to refresh the list after deletion
    } catch (error) {
        console.error('Error deleting claimed item:', error);
        res.status(500).send('Error deleting claimed item');
    }
};






exports.getFilteredClaimedItems = async (req, res) => {
    try {
        const [claimedItems] = await db.query(`
            SELECT 
                ClaimedItems.id,
                ClaimedItems.item_name,
                ClaimedItems.date,
                ClaimedItems.status,
                ClaimedItems.item_status,
                Users.phone,
                Users.name
            FROM ClaimedItems 
            JOIN Users ON ClaimedItems.user_id = Users.id
        `);

        res.render('claimed-items', { claimedItems });
    } catch (error) {
        console.error("Error fetching claimed items:", error);
        res.status(500).send("Error fetching claimed items.");
    }
};


