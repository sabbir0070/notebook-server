const Account = require('../models/Account');

// @desc    Get all accounts (with virtual currentBalance)
// @route   GET /api/accounts
// @access  Private
exports.getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({
      $or: [{ userId: req.user.id }, { sharedWith: req.user.id }],
      isDeleted: { $ne: true }
    }).populate('userId', 'name email').sort('name');

    // Calculate grand total including baseAmounts and all transactions
    let grandTotal = 0;
    accounts.forEach(acc => {
      grandTotal += acc.currentBalance;
    });

    res.status(200).json({
      success: true,
      count: accounts.length,
      grandTotal,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new account
// @route   POST /api/accounts
// @access  Private
exports.createAccount = async (req, res, next) => {
  try {
    req.body.userId = req.user.id;

    const account = await Account.create(req.body);

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a transaction (+ or -) to an account
// @route   POST /api/accounts/:id/transaction
// @access  Private
exports.addTransaction = async (req, res, next) => {
  try {
    const { amount, type, note } = req.body;

    if (!amount || !type) {
      return res.status(400).json({ success: false, error: 'Please provide amount and type (plus/minus)' });
    }

    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found or you are not the owner' });
    }

    account.transactions.push({
      amount: Number(amount),
      type,
      note,
      date: Date.now()
    });

    await account.save();

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete account
// @route   DELETE /api/accounts/:id
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found or you are not the owner' });
    }

    account.isDeleted = true;
    account.deletedAt = Date.now();
    await account.save();

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all soft deleted accounts
// @route   GET /api/accounts/deleted
// @access  Private
exports.getDeletedAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({
      userId: req.user.id,
      isDeleted: true
    }).populate('userId', 'name email').sort('-deletedAt');

    res.status(200).json({
      success: true,
      count: accounts.length,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Restore a soft deleted account
// @route   PUT /api/accounts/:id/restore
// @access  Private
exports.restoreAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: true });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Deleted account not found' });
    }

    account.isDeleted = false;
    account.deletedAt = null;
    await account.save();

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete account
// @route   DELETE /api/accounts/:id/hard
// @access  Private
exports.hardDeleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: true });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Deleted account not found' });
    }

    await account.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Share an account with another user (Read-only)
// @route   POST /api/accounts/:id/share
// @access  Private
exports.shareAccount = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;
    
    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'Please provide target User ID' });
    }

    const account = await Account.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found or you are not the owner' });
    }

    if (targetUserId === req.user.id) {
       return res.status(400).json({ success: false, error: 'Cannot share with yourself' });
    }

    if (!account.sharedWith.includes(targetUserId)) {
      account.sharedWith.push(targetUserId);
      await account.save();
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

// @desc    Share all personal accounts with another user
// @route   POST /api/accounts/share-all
// @access  Private
exports.shareAllAccounts = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ success: false, error: 'Please provide target User ID' });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot share with yourself' });
    }

    await Account.updateMany(
      { userId: req.user.id },
      { $addToSet: { sharedWith: targetUserId } }
    );

    res.status(200).json({ success: true, message: 'All accounts shared successfully' });
  } catch (error) {
    next(error);
  }
};
