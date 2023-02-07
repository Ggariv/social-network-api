const { User, Thought } = require('../models');
const userController = {
    // get all users -> GET /api/users
    getAllUsers(req, res) {
        User.find({})
        // populate user thoughts
        .populate({ path: 'thoughts', select: '-__V' })
        // populate user friends
        .populate({ path: 'friends', select: '-__V' })
        .select('-__v')
        .then(dbUserData => res.json(dbUserData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
            });
        },
    
    // get single user by ID -> GET /api/users/:id
    getUserById({params}, res) {
        User.findOne({_id: params.id })
        .populate({ path: 'thoughts', select: '-__V' })
        .populate({ path: 'friends', select: '-__V' })
        .select('-__v')
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this Id' });
                return;
                }
            res.json(dbUserData);
            })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
            });
        }, 
       
    // create a new user -> POST /api/users
    createUser({body}, res) {
        User.create(body)
        .then(dbUserData => res.json(dbUserData))
        .catch(err => res.status(400).json(err));
        },
 
    // update current user by ID -> PUT /api/users/:id
    updateUser({params, body}, res) {
        User.findOneAndUpdate({_id: params.id}, body, {new: true, runValidators: true})
        .then(dbUserData => {
            if(!dbUserData) {
                res.status(404).json({message: 'No user found with this Id'});
                return;
                }
            res.json(dbUserData);
            })
        .catch(err => res.json(err))
        },
    
    // delete current user by ID -> DELETE /api/users/:id
    deleteUser({params}, res) {
        User.findOneAndDelete({_id: params.id})
        .then(dbUserData => {
            if(!dbUserData) {
                res.status(404).json({message: 'No user found with this Id'});
                return;
                }
            // remove the user from any friends arrays
            User.updateMany(
                { _id : {$in: dbUserData.friends } },
                { $pull: { friends: params.id } }
                )
            .then(() => {
                // remove any comments from this user
                Thought.deleteMany({ username : dbUserData.username })
                .then(() => {
                    res.json({message: "Successfully deleted user"});
                    })
                .catch(err => res.status(400).json(err));
                })
            .catch(err => res.status(400).json(err));
            })
        .catch(err => res.status(400).json(err));
        },

    // add Friend -> POST /api/users/:userId/friends/
    addFriend({ params }, res) {
        // add friendId to userId's friend list
        User.findOneAndUpdate({ _id: params.friendId }, { $addToSet: { friends: params.id } }, { new: true, runValidators: true })
        .populate({path: 'friends'})
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: params });
                return;
                }
            // add userid to friendId's friend list
            User.findOneAndUpdate({ _id: params.id }, { $addToSet: { friends: params.friendId } }, { new: true, runValidators: true })
            .then(dbUserData2 => {
                if(!dbUserData2) {
                    res.status(404).json({ message: 'No user found with this friendId' })
                    return;
                    }
                res.json(dbUserData);
                })
            .catch(err => res.json(err));
            })
        .catch(err => res.json(err));
        },

    // delete Friend -> DELETE /api/users/:userId/friends/
    deleteFriend({ params }, res) {
        // remove friendId from userId's friend list
        User.findOneAndUpdate({ _id: params.friendId }, { $pull: { friends: params.id } }, { new: true, runValidators: true })
        .then(dbUserData => {
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this userId' });
                return;
            }
            // remove userId from friendId's friend list
            User.findOneAndUpdate({ _id: params.id }, { $pull: { friends: params.friendId } }, { new: true, runValidators: true })
            .then(dbUserData2 => {
                if(!dbUserData2) {
                    res.status(404).json({ message: 'No user found with this friendId' })
                    return;
                    }
                res.json({message: 'Successfully deleted the friend'});
                })
            .catch(err => res.json(err));
            })
        .catch(err => res.json(err));
        }
    };

module.exports = userController; 