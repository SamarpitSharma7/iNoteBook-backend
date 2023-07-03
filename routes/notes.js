const express = require("express");
const router = express.Router();
const fetchusers = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const Note = require("../models/Note");

router.get("/fetchallnotes", fetchusers, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
        
    } catch (error) {
        console.error(error.message);
      res.status(500).send("Internal server error");
    }
    
});

router.post(
  "/addnote",
  fetchusers,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Enter a valid description").isLength({
      min: 5,
    }),
  ],async (req, res) => {
    try {
        const {title,description,tag}=req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const note = new Note({
        title,description,tag,user:req.user.id
    })
    const savedNote=await note.save()
    res.json(savedNote);
    } catch (error) {
        console.error(error.message);
      res.status(500).send("Internal server error");
    
    }
    
  }
);

router.put(
    "/updatenote/:id",
    fetchusers,async (req, res) => {
        const {title,description,tag}=req.body;
        try {
            
            const newNote={};
            if(title) {
                newNote.title=title
            }
            if(description) {
                newNote.description=description
            }
            if(tag) {
                newNote.tag=tag
            }
    
            let note=await Note.findById(req.params.id);
            if(!note) {
                return res.status(404).send("Not found");
            }
            if(note.user.toString()!=req.user.id) {
                return res.status(401).send("Not allowed");
            }
            note=await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new :true})
            res.json({note});
        } catch (error) {
            console.error(error.message);
      res.status(500).send("Internal server error");
        }
    })


    router.delete(
        "/deletenote/:id",
        fetchusers,async (req, res) => {
            const {title,description,tag}=req.body;
            try {
                let note=await Note.findById(req.params.id);
                if(!note) {
                    return res.status(404).send("Not found");
                }
                if(note.user.toString()!=req.user.id) {
                    return res.status(401).send("Not allowed");
                }
                note=await Note.findByIdAndDelete(req.params.id)
                res.json({"Success" :"note has been deleted",note:note});
                
            } catch (error) {
                console.error(error.message);
      res.status(500).send("Internal server error");
            }
        })

module.exports = router;
