import { createRouter } from "~/lib/create-app";
// import get_route from './get'
// import post_route from './post'
import create_route from './create'
import list_route from './list'
// import update_route from './update'
// import delete_route from './delete'
import release_route from './release/route'

const router = createRouter()

// router.route('', get_route)
// router.route('', post_route)
router.route('', create_route)
router.route('', list_route)
// router.route('', update_route)
// router.route('', delete_route)
router.route('', release_route)

export default router