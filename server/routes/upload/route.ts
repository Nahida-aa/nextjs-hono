import { createRouter } from "~/lib/create-app";
// import get_route from './get'
import post_route from './post'
import s3_route from './s3'
// import create_route from './create'
// import update_route from './update'
// import delete_route from './delete'

const router = createRouter()

// router.route('', get_route)
router.route('', post_route)
router.route('', s3_route)
// router.route('', update_route)
// router.route('', delete_route)

export default router