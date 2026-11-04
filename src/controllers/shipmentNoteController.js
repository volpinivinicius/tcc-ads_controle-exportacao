/**
 * Append-only: create and list only. See shipmentNoteService for
 * the stage-aware visibility rules.
 */

const shipmentNoteService = require("../services/shipmentNoteService");

async function create(req, res, next) {
  try {
    const note = await shipmentNoteService.createUserNote(req.body, req.user);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const notes = await shipmentNoteService.listNotes(req.params.id, req.user);
    res.json(notes);
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list };