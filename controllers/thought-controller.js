const { Thought, User } = require('../models');
const thoughtController = {
    // get all thoughts -> GET /api/thoughts
    getAllThoughts(req, res) {
        Thought.find({})
        .populate({path: 'reactions', select: '-__v'})
        .select('-__v')
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
            });
        },
    
    // get a single thought by ID -> GET /api/thoughts/:id
    getThoughtsbyId({params}, res) {
        Thought.findOne({_id: params.id })
        .populate({ path: 'reactions', select: '-__V' })
        .select('-__v')
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this Id' });
                return;
                }
            res.json(dbThoughtData);
            })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
            });
        },
    
    // create a thought 
    createThought({params, body}, res) {
        Thought.create(body)
        .then(dbThoughtData => {
            User.findOneAndUpdate({ _id: body.userId }, { $push: { thoughts: dbThoughtData._id } }, { new: true })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: body });
                    return;
                    }
                res.json(dbUserData);
                })
            .catch(err => res.json(err));
            })
        .catch(err => res.status(400).json(err));
        },
    
    // update a thought by ID -> PUT /api/thoughts/:id
    updateThought({params, body}, res) {
        Thought.findOneAndUpdate({_id: params.id}, body, {new: true, runValidators: true})
        .populate({ path: 'reactions', select: '-__V' })
        .select('-__v')
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this Id' });
                return;
                }
            res.json(dbThoughtData);
            })
        .catch(err => res.json(err)); 
        },

    // delete a thought by ID -> DELETE /api/thoughts/:id
    deleteThought({params}, res) {
        Thought.findOneAndDelete({_id: params.id})
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this Id' });
                return;
                }
            // delete the reference to deleted thought in user's thought array
            User.findOneAndUpdate(
                { username: dbThoughtData.username },
                { $pull: { thoughts: params.id } }
                )
            .then(() => {
                res.json({message: 'Successfully deleted the thought'});
                })
            .catch(err => res.status(500).json(err));
            })
        .catch(err => res.json(err)); 
        },
    
    // add a reaction -> POST /api/thoughts/:id/reactions
    addReaction({params, body}, res) {
        Thought.findOneAndUpdate({_id: params.thoughtId}, {$push: {reactions: body}}, {new: true, runValidators: true})
        .populate({ path: 'reactions', select: ('-__v') })
        .select('-__v')
        .then(dbThoughtData => {
            if(!dbThoughtData) {
                res.status(404).json({message: 'No thought found with this Id'});
                return;
                }
            res.json(dbThoughtData);
            })
        .catch(err => res.status(400).json(err));
        },

    // delete a reaction by ID -> DELETE /api/thoughts/:id/reactions
    deleteReaction({params}, res) {
        Thought.findOneAndUpdate({_id: params.thoughtId}, {$pull: {reactions: {reactionId: params.reactionId}}}, {new : true, runValidators: true})
        .then(dbThoughtData => {
            if(!dbThoughtData) {
                res.status(404).json({message: 'No thought found with this Id'});
                return;
                }
            res.json({message: 'Successfully deleted the reaction'});
            })
        .catch(err => res.status(400).json(err));
        }
    };

module.exports = thoughtController;