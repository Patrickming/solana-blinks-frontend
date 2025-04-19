import { NextResponse } from 'next/server';
// Correct import based on other tutorial routes
import { pool } from '../../../../../../lib/config/database'; // Adjusted relative path
import logger from '../../../../../../lib/backend-utils/logger'; // Adjusted relative path

export async function POST(request, { params }) {
  const documentId = parseInt(params.documentId, 10);
  let connection;

  if (isNaN(documentId)) {
    logger.warn('Increment download count failed: Invalid document ID', { documentId: params.documentId });
    return NextResponse.json({ message: 'Invalid document ID' }, { status: 400 });
  }

  try {
    connection = await pool.getConnection();

    const [result] = await connection.query(
      'UPDATE tutorial_documents SET download_count = download_count + 1 WHERE id = ?',
      [documentId]
    );

    if (result.affectedRows === 0) {
      logger.warn('Increment download count failed: Document not found', { documentId });
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    logger.info('Incremented download count successfully', { documentId });
    return new NextResponse(null, { status: 204 }); // Success, No Content

  } catch (error) {
    logger.error(`Error incrementing download count for document ${documentId}:`, { error: error.message, stack: error.stack });
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
} 