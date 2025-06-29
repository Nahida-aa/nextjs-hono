import { createRouter } from "~/lib/create-app";
// import get_route from './get'
// import post_route from './post'
import create_route from './create'
// import update_route from './update'
// import delete_route from './delete'

// import members_route from '../members/route'

const router = createRouter()

// router.route('', get_route)
// router.route('', post_route)
router.route('', create_route)
// router.route('', update_route)
// router.route('', delete_route)

// router.route('', members_route)

export default router