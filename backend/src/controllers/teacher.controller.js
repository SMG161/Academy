const Course = require('../models/Course.model');
const { getPagination, buildPagination } = require('../utils/pagination');

// Paginated, searchable list of the signed-in teacher's own courses.
exports.getMyCourses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req, { defaultLimit: 10, maxLimit: 50 });
    const search = (req.query.search || '').trim();

    const filter = { teacher: req.user.userId };
    if (search) {
      filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name price description lectures createdAt'),
      Course.countDocuments(filter),
    ]);

    const items = courses.map((course) => ({
      _id: course._id,
      name: course.name,
      price: course.price,
      description: course.description,
      numLectures: course.lectures.length,
      createdAt: course.createdAt,
    }));

    res.json({ items, pagination: buildPagination({ page, limit, total }) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
